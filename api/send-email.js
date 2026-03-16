export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    dishName,
    dishPrice,
    quantity,
    totalPrice,
    customerName,
    customerPhone,
    orderDate,
    orderTime,
    specialRequests,
    submissionTime
  } = req.body;

  if (!customerName || !customerPhone || !dishName || !quantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'timfesc@gmail.com',
        subject: `Новый заказ в Restorante: ${dishName} (${quantity} шт.)`,
        html: `
          <!DOCTYPE html>
          <html lang="ru">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; background: #faf8f3; padding: 20px; border-radius: 8px; }
              .header { background: linear-gradient(135deg, #2d5016 0%, #1f3a0a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 5px 0 0 0; opacity: 0.9; }
              .content { background: white; padding: 30px; border: 1px solid #e8dcc8; }
              .section { margin-bottom: 25px; }
              .section h2 { color: #2d5016; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0; border-bottom: 2px solid #c9a961; padding-bottom: 8px; }
              .row { display: flex; justify-content: space-between; padding: 8px 0; }
              .label { font-weight: 600; color: #2c2c2c; }
              .value { color: #666; }
              .price-section { background: #f5f3f0; padding: 15px; border-radius: 6px; margin-top: 10px; }
              .total-price { font-size: 24px; color: #c9a961; font-weight: bold; text-align: right; }
              .footer { background: #1a1410; color: #faf8f3; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
              .highlight { background: #faf8f3; padding: 3px 6px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍝 Restorante</h1>
                <p>Новый заказ получен!</p>
              </div>
              
              <div class="content">
                <div class="section">
                  <h2>📋 Детали заказа</h2>
                  <div class="row">
                    <span class="label">Блюдо:</span>
                    <span class="value"><strong>${dishName}</strong></span>
                  </div>
                  <div class="row">
                    <span class="label">Цена за единицу:</span>
                    <span class="value">€${dishPrice}</span>
                  </div>
                  <div class="row">
                    <span class="label">Количество:</span>
                    <span class="value">${quantity} шт.</span>
                  </div>
                  
                  <div class="price-section">
                    <div class="row">
                      <span class="label">Сумма к оплате:</span>
                      <span class="total-price">€${totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h2>👤 Информация о клиенте</h2>
                  <div class="row">
                    <span class="label">Имя:</span>
                    <span class="value">${customerName}</span>
                  </div>
                  <div class="row">
                    <span class="label">Телефон:</span>
                    <span class="value"><a href="tel:${customerPhone.replace(/\s/g, '')}" style="color: #c9a961; text-decoration: none;">${customerPhone}</a></span>
                  </div>
                </div>

                <div class="section">
                  <h2>📅 Информация о доставке</h2>
                  <div class="row">
                    <span class="label">Дата доставки:</span>
                    <span class="value">${formatDate(orderDate)}</span>
                  </div>
                  <div class="row">
                    <span class="label">Время доставки:</span>
                    <span class="value">${orderTime || 'Не указано'}</span>
                  </div>
                </div>

                ${specialRequests ? `
                <div class="section">
                  <h2>💬 Особые пожелания</h2>
                  <div style="background: #f5f3f0; padding: 12px; border-radius: 6px; font-style: italic; color: #666;">
                    ${specialRequests}
                  </div>
                </div>
                ` : ''}

                <div class="section" style="border-top: 2px solid #e8dcc8; padding-top: 15px; color: #999; font-size: 12px;">
                  <strong>Время получения заказа:</strong> ${submissionTime}
                </div>
              </div>

              <div class="footer">
                <p>Restorante © 2024 | Доставка по Франкфурту<br>Ответьте на этот email или позвоните клиенту для подтверждения</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        message: 'Failed to send email',
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order received and email sent successfully'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// Helper function to format date
function formatDate(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
}
