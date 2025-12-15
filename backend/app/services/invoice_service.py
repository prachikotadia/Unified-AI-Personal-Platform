"""
Invoice Generation Service
Handles invoice generation and formatting
"""
import structlog
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.marketplace_db import Order, OrderItem

logger = structlog.get_logger()

class InvoiceService:
    """Service for invoice generation"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
    
    def generate_invoice(self, order_id: int) -> Dict[str, Any]:
        """
        Generate invoice for order
        
        Args:
            order_id: Order ID
            
        Returns:
            Invoice data
        """
        try:
            order = self.db.query(Order).filter(Order.id == order_id).first()
            if not order:
                raise ValueError(f"Order {order_id} not found")
            
            # Get order items
            items = self.db.query(OrderItem).filter(
                OrderItem.order_id == order_id
            ).all()
            
            invoice_number = f"INV-{order_id:06d}"
            
            invoice_data = {
                "invoice_number": invoice_number,
                "order_id": order_id,
                "order_number": order.order_number,
                "invoice_date": datetime.utcnow().isoformat(),
                "order_date": order.created_at.isoformat() if order.created_at else None,
                
                # Customer info (would come from user)
                "customer": {
                    "name": "Customer Name",  # Would get from user
                    "email": "customer@example.com",  # Would get from user
                    "billing_address": order.billing_address or {}
                },
                
                # Shipping info
                "shipping_address": order.shipping_address or {},
                
                # Items
                "items": [
                    {
                        "product_id": item.product_id,
                        "quantity": item.quantity,
                        "unit_price": item.unit_price,
                        "total_price": item.total_price,
                        "product_name": "Product Name"  # Would get from product
                    }
                    for item in items
                ],
                
                # Totals
                "subtotal": order.subtotal,
                "tax": order.tax,
                "shipping": order.shipping_cost,
                "discount": order.discount,
                "total": order.total,
                
                # Payment info
                "payment_method": order.payment_method.value if order.payment_method else None,
                "payment_status": order.payment_status.value if order.payment_status else None,
                
                # Status
                "order_status": order.status.value if order.status else None,
                
                # Metadata
                "generated_at": datetime.utcnow().isoformat()
            }
            
            return invoice_data
            
        except Exception as e:
            self.logger.error(f"Error generating invoice: {e}")
            raise
    
    def format_invoice_pdf(self, invoice_data: Dict[str, Any]) -> bytes:
        """
        Format invoice as PDF
        
        Args:
            invoice_data: Invoice data
            
        Returns:
            PDF bytes
        """
        # In real app, use libraries like:
        # - reportlab
        # - weasyprint
        # - pdfkit
        
        # Mock PDF generation
        pdf_content = f"""
INVOICE
Invoice Number: {invoice_data['invoice_number']}
Order Number: {invoice_data['order_number']}
Date: {invoice_data['invoice_date']}

Customer: {invoice_data['customer']['name']}
Email: {invoice_data['customer']['email']}

Items:
{chr(10).join(f"- {item['product_name']} x{item['quantity']} @ ${item['unit_price']:.2f} = ${item['total_price']:.2f}" for item in invoice_data['items'])}

Subtotal: ${invoice_data['subtotal']:.2f}
Tax: ${invoice_data['tax']:.2f}
Shipping: ${invoice_data['shipping']:.2f}
Discount: ${invoice_data['discount']:.2f}
Total: ${invoice_data['total']:.2f}

Payment Method: {invoice_data['payment_method']}
Status: {invoice_data['order_status']}
"""
        
        return pdf_content.encode('utf-8')
    
    def format_invoice_html(self, invoice_data: Dict[str, Any]) -> str:
        """
        Format invoice as HTML
        
        Args:
            invoice_data: Invoice data
            
        Returns:
            HTML string
        """
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Invoice {invoice_data['invoice_number']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }}
        .invoice-info {{ float: right; text-align: right; }}
        .items {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .items th, .items td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        .items th {{ background-color: #f2f2f2; }}
        .totals {{ float: right; margin-top: 20px; }}
        .total-row {{ font-weight: bold; font-size: 1.2em; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <div class="invoice-info">
            <p><strong>Invoice #:</strong> {invoice_data['invoice_number']}</p>
            <p><strong>Order #:</strong> {invoice_data['order_number']}</p>
            <p><strong>Date:</strong> {invoice_data['invoice_date']}</p>
        </div>
    </div>
    
    <div>
        <h3>Bill To:</h3>
        <p>{invoice_data['customer']['name']}<br>
        {invoice_data['customer']['email']}</p>
    </div>
    
    <table class="items">
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            {''.join(f'<tr><td>{item["product_name"]}</td><td>{item["quantity"]}</td><td>${item["unit_price"]:.2f}</td><td>${item["total_price"]:.2f}</td></tr>' for item in invoice_data['items'])}
        </tbody>
    </table>
    
    <div class="totals">
        <p>Subtotal: ${invoice_data['subtotal']:.2f}</p>
        <p>Tax: ${invoice_data['tax']:.2f}</p>
        <p>Shipping: ${invoice_data['shipping']:.2f}</p>
        <p>Discount: ${invoice_data['discount']:.2f}</p>
        <p class="total-row">Total: ${invoice_data['total']:.2f}</p>
    </div>
</body>
</html>
"""
        return html

# Global service instance (will be initialized with db session)
invoice_service = None

