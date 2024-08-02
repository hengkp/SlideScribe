chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadPDF') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      function: downloadSlidesAsPDF,
      files: ['jspdf.min.js'] // Include the jsPDF script
    });
  }
});

function downloadSlidesAsPDF() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => {
    const { jsPDF } = window.jspdf;
    const canvases = document.querySelectorAll('canvas');
    const pdf = new jsPDF('landscape');
    canvases.forEach((canvas, index) => {
      const imgData = canvas.toDataURL('image/png');
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
    });
    pdf.save('slides.pdf');
  };
  document.body.appendChild(script);
}