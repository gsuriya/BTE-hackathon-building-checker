import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aqzxzwbxqjlwbmvbgxvw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxenh6d2J4cWpsd2JtdmJneHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MzI0NzAsImV4cCI6MjAyNjIwODQ3MH0.Yx_FMdk2qKwZF9K_4tFY6XhGJ_8_UZGHGm5CqNEQYYo'

console.log('Initializing Supabase client...')
const supabase = createClient(supabaseUrl, supabaseKey)

async function getSampleAddresses() {
  try {
    console.log('Attempting to fetch data from Supabase...')
    
    // First, try a simple health check
    const { data: healthCheck, error: healthError } = await supabase
      .from('nyc_housing_data')
      .select('count()', { count: 'exact' })
      .limit(1)

    if (healthError) {
      console.error('Health check failed:', healthError)
      throw healthError
    }
    
    console.log('Health check passed, proceeding with main query...')

    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select('House Number, Street Name, Borough')
      .limit(5)

    if (error) {
      console.error('Query error:', error)
      throw error
    }

    console.log('Fetched addresses:', data)
    return data
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    })
    throw error
  }
}

// Set a timeout for the entire operation
const timeoutId = setTimeout(() => {
  console.error('Request timed out after 10 seconds')
  process.exit(1)
}, 10000)

// Execute the function and handle the promise
getSampleAddresses()
  .then(() => {
    clearTimeout(timeoutId)
    console.log('Operation completed successfully')
  })
  .catch((error) => {
    clearTimeout(timeoutId)
    console.error('Operation failed:', error)
    process.exit(1)
  }) 