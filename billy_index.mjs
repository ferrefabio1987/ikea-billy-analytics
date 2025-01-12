const fs = require('fs')
const path = require('path')
const os = require('os')
const csv = require('csv-parser')

// File di input e output
const inputFilePath = path.join(__dirname, 'billy_prices.csv')
const outputFilePath = path.join(__dirname, 'billy_index.csv')

// Oggetto per raccogliere i dati aggregati
const aggregatedData = {}

// Mappatura dei pesi dei prodotti
const productWeights = {
  'BILLY Bookcase white 80x28x202 cm': 0.4,
  'BILLY Bookcase white 40x28x202 cm': 0.4,
  'BILLY Bookcase white 80x28x106 cm': 0.2
}

// Funzione per ottenere il mese e l'anno da una data in formato gg/mm/aa
function getMonthYear(dateString) {
  if (!dateString) return null
  const [day, month, year] = dateString.split('/')
  return `20${year}-${month}` // Aggiunge "20" per convertire l'anno in formato YYYY
}

// Leggere il file CSV di input con punto e virgola come separatore
fs.createReadStream(inputFilePath)
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    console.log('Processing row:', row)

    const date = row['Date']
    const monthYear = getMonthYear(date)

    if (!monthYear) {
      console.warn(`Skipped row due to invalid date: ${date}`)
      return // Salta righe con date non valide
    }

    const country = row['Country Name'] // Nome corretto della colonna
    const product = row['Product']
    const price = parseFloat(row['Price in EUR'].replace(',', '.')) || 0

    if (!aggregatedData[monthYear]) {
      aggregatedData[monthYear] = {}
    }

    // Aggregare i dati per prodotto
    if (!aggregatedData[monthYear][country]) {
      aggregatedData[monthYear][country] = {
        products: {},
        total: { weightedSum: 0, weightSum: 0 }
      }
    }
    if (!aggregatedData[monthYear][country].products[product]) {
      aggregatedData[monthYear][country].products[product] = {
        totalPrice: 0,
        count: 0,
        weight: productWeights[product] || 0
      }
    }

    // Aggregare i dati per il prodotto
    aggregatedData[monthYear][country].products[product].totalPrice += price
    aggregatedData[monthYear][country].products[product].count += 1

    // Calcolare la somma complessiva e i pesi
    aggregatedData[monthYear][country].total.weightedSum += price * (productWeights[product] || 0)
    aggregatedData[monthYear][country].total.weightSum += productWeights[product] || 0
  })

  // Modifiche all'interno della sezione "on('end', ...)" del codice
  .on('end', () => {
    console.log('Aggregated data:', aggregatedData)

    // Oggetto per raccogliere dati globali
    const globalData = {}

    // Trasformare i dati aggregati in un formato adatto per il CSV
    const result = []
    for (const [monthYear, countries] of Object.entries(aggregatedData)) {
      if (!globalData[monthYear]) {
        globalData[monthYear] = {
          products: {},
          total: { weightedSum: 0, weightSum: 0 }
        }
      }

      for (const [country, data] of Object.entries(countries)) {
        const { products, total } = data

        // Aggiungere le medie dei singoli prodotti
        for (const [product, productData] of Object.entries(products)) {
          const averagePrice = productData.totalPrice / productData.count
          result.push({
            Month: monthYear,
            Country: country,
            Product: product,
            'Average Price in EUR': averagePrice.toLocaleString('it-IT', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          })

          // Accumulare i dati globali
          if (!globalData[monthYear].products[product]) {
            globalData[monthYear].products[product] = {
              totalPrice: 0,
              count: 0
            }
          }
          globalData[monthYear].products[product].totalPrice += productData.totalPrice
          globalData[monthYear].products[product].count += productData.count
        }

        // Calcolare la media ponderata complessiva per il paese
        const weightedAverage = total.weightedSum / total.weightSum
        result.push({
          Month: monthYear,
          Country: country,
          Product: 'Country Weighted Average',
          'Average Price in EUR': weightedAverage.toLocaleString('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        })

        // Accumulare i dati totali globali
        globalData[monthYear].total.weightedSum += total.weightedSum
        globalData[monthYear].total.weightSum += total.weightSum
      }

      // Calcolare le medie globali
      for (const [product, productData] of Object.entries(globalData[monthYear].products)) {
        const globalAveragePrice = productData.totalPrice / productData.count
        result.push({
          Month: monthYear,
          Country: 'World',
          Product: product,
          'Average Price in EUR': globalAveragePrice.toLocaleString('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        })
      }

      // Calcolare la media ponderata globale
      const globalWeightedAverage =
        globalData[monthYear].total.weightedSum / globalData[monthYear].total.weightSum
      result.push({
        Month: monthYear,
        Country: 'World',
        Product: 'World Weighted Average',
        'Average Price in EUR': globalWeightedAverage.toLocaleString('it-IT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      })

      // Salva la World Weighted Average per gennaio 2025
      if (monthYear === '2025-01') {
        worldWeightedAverageJanuary2025 = globalWeightedAverage
      }
    }

    // Aggiungere il "Country Index" per ogni paese
    if (worldWeightedAverageJanuary2025 !== null) {
      for (const [monthYear, countries] of Object.entries(aggregatedData)) {
        for (const [country, data] of Object.entries(countries)) {
          const countryWeightedAverage = data.total.weightedSum / data.total.weightSum
          const countryIndex = countryWeightedAverage / worldWeightedAverageJanuary2025
          result.push({
            Month: monthYear,
            Country: country,
            Product: 'Country Index',
            'Average Price in EUR': countryIndex.toLocaleString('it-IT', {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4
            })
          })
        }
      }
      // Aggiungere il "World Index" per ogni mese
      for (const [monthYear, countries] of Object.entries(aggregatedData)) {
        const globalWeightedAverage =
          globalData[monthYear].total.weightedSum / globalData[monthYear].total.weightSum
        const worldIndex = globalWeightedAverage / worldWeightedAverageJanuary2025
        result.push({
          Month: monthYear,
          Country: 'World',
          Product: 'World Index',
          'Average Price in EUR': worldIndex.toLocaleString('it-IT', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
          })
        })
      }
    }

    if (result.length === 0) {
      console.error('No data to write. Please check the input file and processing logic.')
      return
    }

    // Funzione per generare il contenuto del CSV con separatore ';'
    function generateCsvContent(results) {
      // Verifica se ci sono dati
      if (results.length === 0) return ''

      // Estrai le intestazioni (chiavi dell'oggetto del primo elemento)
      const headers = Object.keys(results[0])

      // Unisci le intestazioni con il separatore ';'
      const headerLine = headers.join(';')

      // Unisci i dati
      const dataLines = results
        .map((result) => {
          return Object.values(result).join(';') // Unisce i valori dell'oggetto con un separatore ';'
        })
        .join(os.EOL) // Aggiunge una nuova riga per ogni risultato

      // Restituisci il contenuto completo: intestazioni + dati
      return headerLine + os.EOL + dataLines
    }

    const csvContent = generateCsvContent(result)
    fs.writeFileSync(outputFilePath, csvContent)
    console.log(`File "${outputFilePath}" generated successfully!`)
  })
  .on('error', (err) => {
    console.error('Error reading the CSV file:', err)
  })
