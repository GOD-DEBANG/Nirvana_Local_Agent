import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fetchRawTelemetry } from '../api';

/**
 * reportUtils.js — Diagnostic Report Generator
 * Creates PDF documents for WiFi and Bluetooth subsystems.
 */

export async function downloadWiFiReport(history) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  doc.setFontSize(22);
  doc.setTextColor(124, 58, 237); // CFA Violet
  doc.text('CFA WiFi Diagnostic Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${timestamp}`, 14, 30);
  doc.text('Confidential - Cognitive Field Analyzer v1.0', 14, 35);

  const tableColumn = ["Time", "RSSI (dBm)", "WiFi CSI", "GCS Score"];
  const tableRows = history.map(entry => [
    new Date(entry.ts).toLocaleTimeString(),
    (entry.wifiCSI / 2 - 100).toFixed(1), 
    entry.wifiCSI.toFixed(1),
    entry.gcs.toFixed(1)
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237] }
  });

  try {
    const rawData = await fetchRawTelemetry().catch(e => {
        if (e.message?.includes('401')) return { raw: "AUTHENTICATION FAILED (401). ACTION: Please refresh the dashboard and re-complete the HANDSHAKE/ENROLLMENT modal to sync with the agent." };
        return { raw: "AGENT OFFLINE. ACTION: Please ensure the Java Agent is running in your terminal." };
    });
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Explicitly add a new page for diagnostic logs
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(124, 58, 237);
    doc.text('RAW DIAGNOSTIC LOGS (OS DATA)', 14, 25);
    
    doc.setFontSize(7);
    doc.setFont("courier", "normal");
    doc.setTextColor(50);
    const splitText = doc.splitTextToSize(rawData.raw || "No raw telemetry collected.", 182);
    doc.text(splitText, 14, 35);
  } catch (e) {
    console.error("Failed to append raw telemetry", e);
  }

  doc.save(`CFA_WiFi_Report_${Date.now()}.pdf`);
}

export async function downloadBluetoothReport(history) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text('CFA Bluetooth Diagnostic Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${timestamp}`, 14, 30);
  doc.text('Confidential - Cognitive Field Analyzer v1.0', 14, 35);

  const tableColumn = ["Time", "Device Count", "BT CSI", "GCS Score"];
  const tableRows = history.map(entry => [
    new Date(entry.ts).toLocaleTimeString(),
    entry.btDeviceCount || '0',
    entry.btCSI.toFixed(1),
    entry.gcs.toFixed(1)
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });

  try {
    const rawData = await fetchRawTelemetry().catch(e => {
        if (e.message?.includes('401')) return { raw: "AUTHENTICATION FAILED (401). ACTION: Please refresh the dashboard and re-complete the HANDSHAKE/ENROLLMENT modal to sync with the agent." };
        return { raw: "AGENT OFFLINE. ACTION: Please ensure the Java Agent is running in your terminal." };
    });
    
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text('RAW DIAGNOSTIC LOGS (OS DATA)', 14, 25);
    
    doc.setFontSize(7);
    doc.setFont("courier", "normal");
    doc.setTextColor(50);
    const splitText = doc.splitTextToSize(rawData.raw || "No raw telemetry collected.", 182);
    doc.text(splitText, 14, 35);
  } catch (e) {
    console.error("Failed to append raw telemetry", e);
  }

  doc.save(`CFA_Bluetooth_Report_${Date.now()}.pdf`);
}
