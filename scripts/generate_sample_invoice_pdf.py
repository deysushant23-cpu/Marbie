import sys
import os
import subprocess

try:
    from fpdf import FPDF
except ImportError:
    print("Installing fpdf2...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2"])
    from fpdf import FPDF

class InvoicePDF(FPDF):
    def header(self):
        # Brand Name
        self.set_font("Helvetica", "B", 24)
        self.set_text_color(15, 23, 42) # #0f172a
        self.cell(110, 10, "MARBIE JEWELS", 0, 0, "L")
        
        # Invoice Title
        self.set_font("Helvetica", '', 22)
        self.set_text_color(148, 163, 184) # #94a3b8
        self.cell(80, 10, "INVOICE", 0, 1, "R")
        
        # Subtitle
        self.set_font("Helvetica", '', 10)
        self.set_text_color(100, 116, 139) # #64748b
        self.cell(110, 6, "Luxury Bridal & Contemporary Jewelry", 0, 0, "L")
        
        # Invoice Number
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(51, 65, 85) # #334155
        self.cell(80, 6, "#ORD-9821", 0, 1, "R")
        
        # Owner Info
        self.set_font("Helvetica", '', 9)
        self.set_text_color(51, 65, 85)
        self.cell(190, 5, "Owner/Management: Baisakhi Kanthariya | Official Email: marbiejewels4@gmail.com", 0, 1, "L")
        
        # Divider Line
        self.ln(4)
        self.set_draw_color(226, 232, 240) # #e2e8f0
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-25)
        self.set_draw_color(241, 245, 249)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)
        self.set_font("Helvetica", '', 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 4, "Marbie Jewels - Official Commercial Invoice", 0, 1, "C")
        self.cell(0, 4, "For order assistance, support, or verification, contact Owner/Management directly:", 0, 1, "C")
        self.set_font("Helvetica", "B", 8)
        self.cell(0, 4, "Baisakhi Kanthariya | Email: marbiejewels4@gmail.com | Web: www.marbie.com", 0, 1, "C")

def create_sample_invoice(filename="Sample_Invoice_Marbie_Jewels.pdf"):
    pdf = InvoicePDF(orientation="P", unit="mm", format="A4")
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=30)
    
    # Billed To & Invoice Details Section
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(100, 6, "BILLED TO", 0, 0, "L")
    pdf.cell(90, 6, "INVOICE DETAILS", 0, 1, "R")
    
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(100, 6, "Valued Customer", 0, 0, "L")
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(90, 6, "Date Issued: Oct 24, 2024", 0, 1, "R")
    
    pdf.cell(100, 5, "Direct Storefront Purchase", 0, 0, "L")
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(90, 5, "Payment Status: PAID ONLINE (Verified Gateway)", 0, 1, "R")
    
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(100, 5, "Customer Account", 0, 0, "L")
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(40, 116, 240) # Flipkart/Ekart Blue
    pdf.cell(90, 5, "Delivery Partner: Ekart Logistics", 0, 1, "R")
    
    pdf.ln(8)
    
    # Table Header
    pdf.set_fill_color(248, 250, 252) # #f8fafc
    pdf.set_draw_color(226, 232, 240)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(100, 116, 139)
    
    pdf.cell(85, 8, " PRODUCT DETAILS", "TB", 0, "L", fill=True)
    pdf.cell(35, 8, "SKU ", "TB", 0, "L", fill=True)
    pdf.cell(20, 8, "QTY", "TB", 0, "C", fill=True)
    pdf.cell(25, 8, "PRICE", "TB", 0, "R", fill=True)
    pdf.cell(25, 8, "TOTAL ", "TB", 1, "R", fill=True)
    
    # Table Items
    items = [
        {"name": "Ethereal Solitaire Ring", "sku": "MB-4921", "qty": 1, "price": "1,500", "total": "1,500"},
        {"name": "Marbie Royal Bridal Necklace", "sku": "MB-8832", "qty": 1, "price": "35,000", "total": "35,000"},
    ]
    
    pdf.set_font("Helvetica", '', 10)
    for item in items:
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(85, 10, f" {item['name']}", "B", 0, "L")
        
        pdf.set_font("Courier", '', 9)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(35, 10, item['sku'], "B", 0, "L")
        
        pdf.set_font("Helvetica", '', 10)
        pdf.set_text_color(51, 65, 85)
        pdf.cell(20, 10, str(item['qty']), "B", 0, "C")
        pdf.cell(25, 10, f"INR {item['price']}", "B", 0, "R")
        
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(25, 10, f"INR {item['total']} ", "B", 1, "R")
        
    pdf.ln(8)
    
    # Summary Section
    # Left Box: Payment Info
    current_y = pdf.get_y()
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(100, 6, "PAYMENT INFO", 0, 1, "L")
    
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(100, 5, "Verified Electronic Payment (Gateway)", 0, 1, "L")
    pdf.cell(100, 5, "Marbie Secure Checkout - Verified", 0, 1, "L")
    
    # Right Box: Totals
    pdf.set_xy(110, current_y)
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(50, 6, "Subtotal", 0, 0, "L")
    pdf.set_text_color(15, 23, 42)
    pdf.cell(30, 6, "INR 36,500", 0, 1, "R")
    
    pdf.set_xy(110, pdf.get_y())
    pdf.set_text_color(100, 116, 139)
    pdf.cell(50, 6, "Courier / Shipping", 0, 0, "L")
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(40, 116, 240)
    pdf.cell(30, 6, "FREE (INR 0.00)", 0, 1, "R")
    
    pdf.set_xy(110, pdf.get_y() + 2)
    pdf.set_draw_color(226, 232, 240)
    pdf.line(110, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(2)
    
    pdf.set_xy(110, pdf.get_y())
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 8, "Total Due", 0, 0, "L")
    pdf.cell(30, 8, "INR 36,500", 0, 1, "R")
    
    pdf.output(filename)
    print(f"Sample PDF invoice created successfully: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_sample_invoice()
