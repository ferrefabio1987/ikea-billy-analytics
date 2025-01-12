import axios from 'axios'
import fs from 'fs'

const API_KEY = process.env.API_KEY_EXCHANGE_RATES
const EXCHANGE_RATE_URL = `https://openexchangerates.org/api/latest.json?app_id=${API_KEY}`

// Leggi le date esistenti dal file e uniformale al formato gg/mm/aa
export function readExistingCsvDates(fileName) {
  const fileContent = fs.readFileSync(fileName, 'utf-8')
  const lines = fileContent.split('\n')
  return lines
    .map((line) => {
      if (!line.trim()) return null // Ignora righe vuote
      const date = line.split(';')[0]
      if (!date) return null // Ignora righe senza data
      const parts = date.includes('-') ? date.split('-') : date.split('/')
      if (parts.length < 3) return null // Ignora righe mal formattate
      const [part1, part2, part3] = parts
      const year = part3 && part3.length === 4 ? part3.slice(-2) : part3
      if (!part1 || !part2 || !year) return null // Ignora righe incomplete
      return `${part1.padStart(2, '0')}/${part2.padStart(2, '0')}/${year}`
    })
    .filter(Boolean) // Rimuove valori null o undefined
}

// Get exchange rates
export async function getExchangeRates() {
  console.log('Fetching exchange rates...')
  try {
    const response = await axios.get(EXCHANGE_RATE_URL)
    if (response.status === 200 && response.data.rates) {
      console.log('Exchange rates fetched successfully.')
      return response.data.rates
    } else {
      console.log(`API error: ${response.data.description || 'Unknown'}`)
      return {}
    }
  } catch (error) {
    console.log(`Error fetching exchange rates: ${error.message}`)
    return {}
  }
}

// Get country details
export async function getCountryDetails(countryCode) {
  console.log(`Fetching country details for ${countryCode}...`)
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
    if (response.status === 200) {
      const country = response.data[0]
      const countryName = country.name.common
      const countryCurrency = Object.keys(country.currencies)[0]
      return { countryName, countryCurrency }
    } else {
      console.log(`No details found for ${countryCode}.`)
      return { countryName: 'Unknown', countryCurrency: 'Unknown' }
    }
  } catch (error) {
    console.log(`Error fetching details for ${countryCode}: ${error.message}`)
    return { countryName: 'Unknown', countryCurrency: 'Unknown' }
  }
}

// Get price from URL
export async function getPrice(url) {
  console.log(`Fetching price...`)
  try {
    const response = await axios.get(url)
    if (response.status === 200) {
      let integerTag, decimalTag, currencyTag

      // Custom selectors for .cn domain
      if (url.includes('.cn')) {
        integerTag = response.data.match(/<span class="i-price__integer">([^<]+)<\/span>/)
        decimalTag = response.data.match(
          /<span class="i-price__decimal">.*?<span class="i-price__separator">[.,]<\/span>(\d+)<\/span>/
        )
        currencyTag = response.data.match(/<span class="i-price__currency">([^<]+)<\/span>/)

        // Custom selectors for .do domain
      } else if (url.includes('.do')) {
        integerTag = response.data.match(/<span class="currency">[^<]+<\/span>([\d,]+)/)
        decimalTag = null
        currencyTag = response.data.match(/<span class="currency">([^<]+)<\/span>/)

        // Custom selectors for .tr domain
      } else if (url.includes('.tr')) {
        integerTag = response.data.match(/<span class="tl">₺<\/span>(\d{1,3}(?:,\d{3})*)/)
        decimalTag = null
        currencyTag = response.data.match(/<span class="tl">([^<]+)<\/span>/)

        // Custom selectors for .tw, .hk and .id domains
      } else if (url.includes('.tw') || url.includes('.hk') || url.includes('.id')) {
        integerTag = response.data.match(/<span\s+data-price="(\d+)"/)
        decimalTag = null
        currencyTag = response.data.match(/<span class="currency">([^<]+)<\/span>/)

        // Custom selectors for .ee, .is, .lt and .lv domains
      } else if (
        url.includes('.ee') ||
        url.includes('.is') ||
        url.includes('.lt') ||
        url.includes('.lv')
      ) {
        integerTag = response.data.match(/<span\s+data-price="(\d+)"/)
        decimalTag = null
        currencyTag = response.data.match(
          /<span class="price__currency-symbol price__currency-symbol--superscript price__currency-symbol--trailing">([^<]+)<\/span>/
        )

        // Default selectors for other domains
      } else {
        integerTag = response.data.match(/<span class="pip-price__integer">([^<]+)<\/span>/)
        decimalTag = response.data.match(
          /<span class="pip-price__decimal">.*?<span class="pip-price__separator">[.,]<\/span>(\d+)<\/span>/
        )
        currencyTag = response.data.match(/<span class="pip-price__currency">([^<]+)<\/span>/)
      }

      const currency = currencyTag ? currencyTag[1].trim() : ''
      const integerPart = integerTag
        ? integerTag[1].trim().replace(/\s+/g, '').replace(/[.,]/g, '')
        : '00'
      const decimalPart = decimalTag ? decimalTag[1].trim() : '00'

      // Unisci la parte intera e decimale, inserendo il punto come separatore
      const price = decimalPart ? `${integerPart}.${decimalPart}` : integerPart

      return { price, currency, decimalPart }
    } else {
      return {
        price: '00',
        currency: 'Currency not found',
        decimalPart: 'Decimal part not found'
      }
    }
    // PARTE DA SISTEMARE
  } catch (error) {
    console.log(`Error fetching price for ${url}: ${error.message}`)
    return {
      price: 'Error Price',
      currency: 'Error Currency',
      decimalPart: 'Error decimal'
    }
  }
}
//
