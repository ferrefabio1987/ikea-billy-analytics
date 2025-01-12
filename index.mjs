import { getCountryDetails, getExchangeRates, getPrice, readExistingCsvDates } from './price.mjs'
import os from 'os'
import { allBilly } from './constants/config.mjs'
import fs from 'fs'
import { parseDate } from './lib/date.mjs'
import { parseNumber } from './lib/number.mjs'

const FILENAME = 'billy_prices.csv'
const ALL_URLS = allBilly

async function main() {
  console.log('Starting data collection...')
  const today = parseDate(new Date())

  const fileExists = fs.existsSync(FILENAME)
  const previousDates = fileExists ? readExistingCsvDates(FILENAME) : []

  if (previousDates.includes(today)) {
    console.log(`Data for ${today} already exists. Exiting...`)
    return
  }

  const exchangeRates = await getExchangeRates()
  const eurToUsdRate = exchangeRates['EUR'] || 1

  console.log('Collecting product data...')
  const results = []

  if (!fileExists) {
    results.push([
      'Date',
      'Product',
      'URL',
      'Currency',
      'Country Name',
      'Country Code',
      'Country Currency',
      'Price',
      'Exchange Rate',
      'Price in USD',
      'Price in EUR'
    ])
  }

  for (const [url, productName] of ALL_URLS) {
    // Estrazione codice paese
    const countryCode =
      url.split('.com/')[1]?.split('/')[0] ||
      url.split('.com.')[1]?.split('/')[0] ||
      url.split('.co.')[1]?.split('/')[0] ||
      url.split('.cn/')[1]?.split('/')[0] ||
      (url.includes('.ee/')
        ? 'ee'
        : url.includes('.is/')
          ? 'is'
          : url.includes('.lt/')
            ? 'lt'
            : url.includes('.lv/')
              ? 'lv'
              : null)
    //
    const { countryName, countryCurrency } = await getCountryDetails(countryCode)
    const { price, currency } = await getPrice(url)

    let priceFloat = parseFloat(price)

    const exchangeRate = exchangeRates[countryCurrency] || 1
    const priceInUsd = parseFloat((priceFloat / exchangeRate).toFixed(2))
    const priceInEur = parseFloat((priceInUsd * eurToUsdRate).toFixed(2))

    // Push dei dati
    results.push([
      today,
      productName,
      url,
      currency,
      countryName,
      countryCode,
      countryCurrency,
      parseNumber(price),
      parseNumber(exchangeRate),
      parseNumber(priceInUsd),
      parseNumber(priceInEur)
    ])
  }

  // Write to CSV
  const csvContent = results.map((result) => result.join(';')).join(os.EOL)
  fs.appendFileSync(FILENAME, `${csvContent}`)
  console.log(`Data exported to ${FILENAME}`)
}

main().catch(console.error)
