from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.colors import HexColor
import io

def generate_simple_pdf():
    """Generate a simple test PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#1e40af'),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    story.append(Paragraph("✈️ FLIGHT TICKET", title_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Test PDF Generation", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

if __name__ == "__main__":
    try:
        pdf_content = generate_simple_pdf()
        print("✅ PDF generation successful!")
        print(f"PDF size: {len(pdf_content)} bytes")
        
        # Save to file for testing
        with open("test_ticket.pdf", "wb") as f:
            f.write(pdf_content)
        print("✅ PDF saved as test_ticket.pdf")
        
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
