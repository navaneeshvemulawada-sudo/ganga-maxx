const recommendationController = {
  /**
   * Generates cleaning product recommendations based on facility characteristics.
   */
  getRecommendations(req, res) {
    try {
      const {
        facility_type = 'Other',
        floors = 1,
        staff_count = 0,
        area = 0,
        cleaning_frequency = 'Daily',
        compliance = []
      } = req.body;

      const floorsNum = parseInt(floors, 10) || 1;
      const staffCountNum = parseInt(staff_count, 10) || 0;
      const areaNum = parseInt(area, 10) || 0;

      let complianceList = compliance || [];
      if (typeof complianceList === 'string') {
        complianceList = complianceList.split(',').map(c => c.trim()).filter(Boolean);
      }

      // Default products database mapping
      const defaultProducts = {
        'FL-012': { sku: 'FL-012', name: 'Floor Cleaner Disinfectant 5L', unit_price: 450.0, unit: 'L', stock: 15, min_stock: 5 },
        'TR-005': { sku: 'TR-005', name: 'Toilet Bowl Cleaner 1L', unit_price: 120.0, unit: 'L', stock: 15, min_stock: 5 },
        'GL-002': { sku: 'GL-002', name: 'Glass & Multi-Surface Cleaner 500ml', unit_price: 80.0, unit: 'pcs', stock: 15, min_stock: 5 },
        'MP-088': { sku: 'MP-088', name: 'Multi-Purpose Cleaner 5L', unit_price: 420.0, unit: 'L', stock: 15, min_stock: 5 },
        'TB-105': { sku: 'TB-105', name: 'Heavy Duty Trash Bags (Large)', unit_price: 180.0, unit: 'pack', stock: 15, min_stock: 5 },
        'HS-045': { sku: 'HS-045', name: 'Liquid Hand Soap 5L', unit_price: 380.0, unit: 'L', stock: 15, min_stock: 5 },
        'NG-099': { sku: 'NG-099', name: 'Nitrile Disposable Gloves (Box of 100)', unit_price: 600.0, unit: 'box', stock: 15, min_stock: 5 },
        'BS-077': { sku: 'BS-077', name: 'Biohazard Trash Bags (Pack of 50)', unit_price: 320.0, unit: 'pack', stock: 15, min_stock: 5 },
        'MC-022': { sku: 'MC-022', name: 'Microfiber Cloths 4-Pack', unit_price: 250.0, unit: 'pack', stock: 15, min_stock: 5 },
        'WM-033': { sku: 'WM-033', name: 'Wet Mop Refill (Cotton)', unit_price: 160.0, unit: 'pcs', stock: 15, min_stock: 5 }
      };

      const freqMultipliers = {
        'Daily': 1.0,
        'Twice Daily': 1.8,
        'Weekly': 0.3,
        'Bi-weekly': 0.2,
        'Monthly': 0.1
      };
      const freqMult = freqMultipliers[cleaning_frequency] || 1.0;

      const recommendations = [];

      // Helper to add recommendation item
      const addRecommendation = (sku, quantity, ecoFriendly) => {
        if (quantity > 0 && defaultProducts[sku]) {
          const prod = { ...defaultProducts[sku] };
          prod.quantity = quantity;
          prod.subtotal = quantity * prod.unit_price;
          prod.eco_friendly = ecoFriendly;
          recommendations.push(prod);
        }
      };

      // 1. Floor Cleaner Disinfectant 5L (FL-012)
      const floorCleanerQty = Math.ceil((areaNum / 4000) * freqMult);
      addRecommendation('FL-012', floorCleanerQty, true);

      // 2. Toilet Bowl Cleaner 1L (TR-005)
      const toiletMultiplier = facility_type === 'Healthcare' ? 1.5 : 1.0;
      const toiletCleanerQty = Math.ceil(floorsNum * 2 * toiletMultiplier * freqMult);
      addRecommendation('TR-005', toiletCleanerQty, false);

      // 3. Glass & Multi-Surface Cleaner 500ml (GL-002)
      const glassCleanerQty = Math.ceil(floorsNum * 1.5 * freqMult);
      addRecommendation('GL-002', glassCleanerQty, true);

      // 4. Multi-Purpose Cleaner 5L (MP-088)
      const mpCleanerQty = Math.ceil((areaNum / 12000) * freqMult);
      addRecommendation('MP-088', mpCleanerQty, true);

      // 5. Heavy Duty Trash Bags (TB-105)
      const trashBagQty = Math.ceil((staffCountNum / 12) * freqMult);
      addRecommendation('TB-105', trashBagQty, true);

      // 6. Liquid Hand Soap 5L (HS-045)
      const soapQty = Math.ceil(staffCountNum / 40);
      addRecommendation('HS-045', soapQty, true);

      // 7. Nitrile Disposable Gloves (NG-099)
      const glovesMult = (facility_type === 'Healthcare' || complianceList.includes('NABH')) ? 3.0 : 1.0;
      const glovesQty = Math.ceil((staffCountNum / 15) * glovesMult);
      addRecommendation('NG-099', glovesQty, false);

      // 8. Biohazard Trash Bags (BS-077)
      if (complianceList.includes('NABH') || complianceList.includes('HACCP') || facility_type === 'Healthcare') {
        const bioQty = Math.ceil(staffCountNum / 20);
        addRecommendation('BS-077', bioQty, false);
      }

      // 9. Microfiber Cloths 4-Pack (MC-022)
      const clothsQty = Math.ceil(floorsNum * 2);
      addRecommendation('MC-022', clothsQty, true);

      // 10. Wet Mop Refill (Cotton) (WM-033)
      const mopsQty = Math.ceil(floorsNum * 0.8);
      addRecommendation('WM-033', mopsQty, true);

      // Summaries calculation
      const estimatedSubtotal = recommendations.reduce((sum, item) => sum + item.subtotal, 0);
      const ecoItems = recommendations.filter(item => item.eco_friendly).length;
      const ecoPercentage = recommendations.length ? Math.round((ecoItems / recommendations.length) * 100) : 0;

      let confidenceScore = 92;
      if (areaNum > 10000 && staffCountNum > 100) {
        confidenceScore = 96;
      }
      if (complianceList.length === 0) {
        confidenceScore -= 5;
      }

      const summaryText = `Recommended cleaning bundle tailored for a ${facility_type} facility spanning ${areaNum.toLocaleString()} sqft across ${floorsNum} floor(s) with ${staffCountNum} personnel. Compliance configuration checks applied: ${complianceList.length ? complianceList.join(', ') : 'None'}.`;

      return res.status(200).json({
        estimated_subtotal: estimatedSubtotal,
        eco_percentage: ecoPercentage,
        confidence_score: confidenceScore,
        items: recommendations,
        summary_text: summaryText
      });
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return res.status(500).json({
        success: false,
        error: 'An unexpected internal server error occurred while generating recommendations.'
      });
    }
  }
};

module.exports = recommendationController;
