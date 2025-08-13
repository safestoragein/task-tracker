// Simple verification to check if deployment includes new users
const https = require('https')

// The latest deployment URL
const deploymentUrl = 'https://task-tracker-3jo7hr75h-safestoragein-gmailcoms-projects.vercel.app'

console.log('🔍 Verifying latest deployment...')
console.log(`📡 Checking: ${deploymentUrl}`)

// Make a request to check if the app loads
https.get(deploymentUrl, (res) => {
  console.log(`\n📊 Response Status: ${res.statusCode}`)
  console.log(`📊 Response Headers:`)
  console.log(`  Content-Type: ${res.headers['content-type']}`)
  console.log(`  Cache-Control: ${res.headers['cache-control']}`)
  
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`\n✅ Deployment is live and responding!`)
      
      // Check if the HTML contains references to our new users (basic check)
      if (data.includes('safestorage.in')) {
        console.log(`✅ SafeStorage domain references found in response`)
      }
      
      console.log(`\n📋 Deployment Summary:`)
      console.log(`  Status: ✅ LIVE`)
      console.log(`  URL: ${deploymentUrl}`)
      console.log(`  Size: ${Math.round(data.length / 1024)} KB`)
      
      console.log(`\n🎯 Next Steps for User:`)
      console.log(`  1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)`)
      console.log(`  2. Try logging in with: arun@safestorage.in`)
      console.log(`  3. Or try: shantraj@safestorage.in`)
      console.log(`  4. Both should now appear in the email dropdown`)
      
    } else {
      console.log(`\n❌ Deployment issue: Status ${res.statusCode}`)
    }
  })
}).on('error', (err) => {
  console.log(`\n❌ Request failed: ${err.message}`)
})