const axios = require('axios')

// Teste simples do webhook
const testWebhook = async () => {
  console.log('🧪 Testando webhook do n8n...')
  
  const webhookUrl = "https://n8n.landcriativa.com/webhook-test/quiz"
  const webhookKey = "XBEHgtft1SvVT75xtvvogD95ExDXCqekgF2emRXDPR4KBx7QLKBfxps3tWfpBHAV"
  
  const testPayload = {
    ttclid: 'TEST_7C8D9E2F1A3B4C5D6E7F8A9B0C1D2E3F',
    email: 'test@example.com',
    timestamp: Date.now(),
    url: 'http://localhost:3000/test',
    referrer: '',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    test: true
  }
  
  console.log('📤 Payload:', testPayload)
  console.log('🌐 URL:', webhookUrl)
  
  try {
    // Tentar sem autenticação primeiro
    console.log('\n1️⃣ Testando sem autenticação...')
    const response1 = await axios.post(webhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })
    console.log('✅ Sucesso sem auth! Status:', response1.status)
    console.log('📄 Response:', response1.data)
    
  } catch (error1) {
    console.log('❌ Falhou sem auth:', error1.response?.status, error1.response?.data)
    
    try {
      // Tentar com Basic auth
      console.log('\n2️⃣ Testando com Basic auth...')
      const basicAuth = Buffer.from(`webhook:${webhookKey}`).toString('base64')
      const response2 = await axios.post(webhookUrl, testPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        timeout: 10000
      })
      console.log('✅ Sucesso com Basic auth! Status:', response2.status)
      console.log('📄 Response:', response2.data)
      
    } catch (error2) {
      console.log('❌ Falhou com Basic auth:', error2.response?.status, error2.response?.data)
      
      try {
        // Tentar com header customizado
        console.log('\n3️⃣ Testando com header customizado...')
        const response3 = await axios.post(webhookUrl, testPayload, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': webhookKey
          },
          timeout: 10000
        })
        console.log('✅ Sucesso com header customizado! Status:', response3.status)
        console.log('📄 Response:', response3.data)
        
      } catch (error3) {
        console.log('❌ Falhou com header customizado:', error3.response?.status, error3.response?.data)
        console.log('💡 O webhook pode não estar ativo no n8n')
      }
    }
  }
}

testWebhook() 