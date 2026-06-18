const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const WebhookService = {
  /**
   * Triggers the n8n webhook on successful quotation creation
   * @param {Object} quotationData - The details of the created quotation
   */
  async triggerQuotationCreated(quotationData) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl.includes('YOUR-N8N-DOMAIN')) {
      console.warn('[Webhook Warning] N8N_WEBHOOK_URL is not configured or uses placeholder. Webhook trigger skipped.');
      return null;
    }

    try {
      const payload = {
        quote_id: quotationData.quote_id,
        customer_name: quotationData.customer_name,
        company_name: quotationData.company_name || null,
        email: quotationData.email,
        institution_type: quotationData.institution_type,
        floors: quotationData.floors !== undefined ? quotationData.floors : null,
        staff_count: quotationData.staff_count !== undefined ? quotationData.staff_count : null,
        cleaning_frequency: quotationData.cleaning_frequency,
        monthly_cost: quotationData.monthly_cost,
        status: quotationData.status || 'Generated'
      };

      console.log(`[Webhook] Triggering n8n webhook at: ${webhookUrl}`);
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 seconds timeout to prevent long-running hanging calls
      });

      console.log(`[Webhook] Success. Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`[Webhook Error] Failed to trigger n8n webhook: ${error.message}`);
      // Return null rather than throwing to avoid failing the client request due to an external service outage
      return null;
    }
  }
};

module.exports = WebhookService;
