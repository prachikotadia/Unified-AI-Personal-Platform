"""
Export Service
Handles exporting financial data to various formats (CSV, PDF, Excel, JSON)
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, date
import json
import csv
import io
import asyncio

logger = structlog.get_logger()

class ExportService:
    """Service for exporting financial data"""
    
    def __init__(self):
        self.logger = logger
    
    async def export_data(
        self,
        data_type: str,
        data: Dict[str, Any],
        format: str = "csv",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Export financial data
        
        Args:
            data_type: Type of data (transactions, budgets, goals, all)
            data: Data to export
            format: Export format (csv, json, excel, pdf)
            start_date: Optional start date filter
            end_date: Optional end date filter
            
        Returns:
            Export file data and metadata
        """
        try:
            self.logger.info(f"Exporting {data_type} data in {format} format")
            
            # Filter data by date if provided
            if start_date or end_date:
                data = self._filter_by_date(data, start_date, end_date)
            
            # Generate export based on format
            if format == "csv":
                file_data = await self._export_csv(data_type, data)
                mime_type = "text/csv"
            elif format == "json":
                file_data = await self._export_json(data_type, data)
                mime_type = "application/json"
            elif format == "excel":
                file_data = await self._export_excel(data_type, data)
                mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            elif format == "pdf":
                file_data = await self._export_pdf(data_type, data)
                mime_type = "application/pdf"
            else:
                raise ValueError(f"Unsupported export format: {format}")
            
            filename = f"finance_export_{data_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}"
            
            return {
                "file_data": file_data,
                "filename": filename,
                "format": format,
                "mime_type": mime_type,
                "file_size": len(file_data) if isinstance(file_data, (str, bytes)) else 0,
                "exported_at": datetime.utcnow()
            }
            
        except Exception as e:
            self.logger.error(f"Error exporting data: {e}")
            raise
    
    def _filter_by_date(self, data: Dict[str, Any], start_date: Optional[date], end_date: Optional[date]) -> Dict[str, Any]:
        """Filter data by date range"""
        filtered_data = data.copy()
        
        if "transactions" in filtered_data:
            transactions = filtered_data["transactions"]
            if start_date:
                transactions = [t for t in transactions if t.get("date") >= start_date]
            if end_date:
                transactions = [t for t in transactions if t.get("date") <= end_date]
            filtered_data["transactions"] = transactions
        
        return filtered_data
    
    async def _export_csv(self, data_type: str, data: Dict[str, Any]) -> str:
        """Export data as CSV"""
        output = io.StringIO()
        
        if data_type == "transactions" and "transactions" in data:
            writer = csv.DictWriter(output, fieldnames=[
                "id", "date", "description", "amount", "category", "type", "merchant", "account_id"
            ])
            writer.writeheader()
            for txn in data["transactions"]:
                writer.writerow({
                    "id": txn.get("id", ""),
                    "date": txn.get("date", ""),
                    "description": txn.get("description", ""),
                    "amount": txn.get("amount", 0),
                    "category": txn.get("category", ""),
                    "type": txn.get("type", ""),
                    "merchant": txn.get("merchant", ""),
                    "account_id": txn.get("account_id", "")
                })
        elif data_type == "budgets" and "budgets" in data:
            writer = csv.DictWriter(output, fieldnames=[
                "id", "name", "category", "amount", "spent", "remaining", "period"
            ])
            writer.writeheader()
            for budget in data["budgets"]:
                writer.writerow({
                    "id": budget.get("id", ""),
                    "name": budget.get("name", ""),
                    "category": budget.get("category", ""),
                    "amount": budget.get("amount", 0),
                    "spent": budget.get("spent", 0),
                    "remaining": budget.get("remaining", 0),
                    "period": budget.get("period", "")
                })
        elif data_type == "goals" and "goals" in data:
            writer = csv.DictWriter(output, fieldnames=[
                "id", "name", "target_amount", "current_amount", "progress_percentage", "target_date"
            ])
            writer.writeheader()
            for goal in data["goals"]:
                writer.writerow({
                    "id": goal.get("id", ""),
                    "name": goal.get("name", ""),
                    "target_amount": goal.get("target_amount", 0),
                    "current_amount": goal.get("current_amount", 0),
                    "progress_percentage": goal.get("progress_percentage", 0),
                    "target_date": goal.get("target_date", "")
                })
        else:
            # Generic CSV export
            writer = csv.writer(output)
            for key, value in data.items():
                if isinstance(value, list):
                    writer.writerow([key])
                    if value and isinstance(value[0], dict):
                        # Write headers
                        writer.writerow(value[0].keys())
                        # Write rows
                        for item in value:
                            writer.writerow(item.values())
                else:
                    writer.writerow([key, value])
        
        return output.getvalue()
    
    async def _export_json(self, data_type: str, data: Dict[str, Any]) -> str:
        """Export data as JSON"""
        export_data = {
            "export_type": data_type,
            "exported_at": datetime.utcnow().isoformat(),
            "data": data
        }
        return json.dumps(export_data, indent=2, default=str)
    
    async def _export_excel(self, data_type: str, data: Dict[str, Any]) -> bytes:
        """Export data as Excel"""
        # In real app, use openpyxl or xlsxwriter
        # For now, return JSON as placeholder
        await asyncio.sleep(0.3)
        json_data = await self._export_json(data_type, data)
        return json_data.encode('utf-8')
    
    async def _export_pdf(self, data_type: str, data: Dict[str, Any]) -> bytes:
        """Export data as PDF"""
        # In real app, use reportlab or weasyprint
        # For now, return JSON as placeholder
        await asyncio.sleep(0.5)
        json_data = await self._export_json(data_type, data)
        return json_data.encode('utf-8')

