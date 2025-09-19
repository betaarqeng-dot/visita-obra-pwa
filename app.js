document.getElementById("gerarPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // ======== CAPA ========
  const logo = await loadImage("logoapp.png");
  doc.addImage(logo, "PNG", 75, 20, 60, 60);

  doc.setFillColor(156,39,176);
  doc.rect(0, 90, 210, 20, "F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.text("RELATÓRIO DE VISITA DE OBRA", 105, 103, { align: "center" });

  const form = document.getElementById("visitaForm");
  const data = new FormData(form);

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(`Cliente: ${data.get("cliente")}`, 20, 130);
  doc.text(`Obra: ${data.get("obra")}`, 20, 140);
  doc.text(`Data da visita: ${data.get("data")}`, 20, 150);
  doc.text(`Responsável: ${data.get("responsavel")}`, 20, 160);

  // ======== PÁGINA 2 - CONTEÚDO ========
  doc.addPage();
  let y = 30;

  const sectionTitle = (text, icon) => {
    doc.setFillColor(156,39,176);
    doc.rect(14, y, 182, 8, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(12);
    doc.text(`${icon} ${text}`, 16, y+6);
    y += 14;
    doc.setTextColor(0);
  };

  const boxText = (label, value) => {
    if(value){
      doc.setFillColor(240,240,240);
      doc.rect(14, y, 182, 8, "F");
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.text(`${label}: ${value}`, 16, y+6);
      y += 12;
    }
  };

  // Informações Gerais
  sectionTitle("Informações Gerais", "📌");
  boxText("Data da visita", data.get("data"));
  boxText("Responsável", data.get("responsavel"));
  boxText("Cliente", data.get("cliente"));
  boxText("Obra", data.get("obra"));

  // Status da obra
  sectionTitle("Status da Obra", "📊");
  boxText("Etapa", data.get("etapa"));
  boxText("Percentual concluído", data.get("percentual") + "%");
  const checklist = data.getAll("checklist").join(", ");
  boxText("Checklist", checklist);

  // Observações
  sectionTitle("Observações Técnicas", "📝");
  const obs = doc.splitTextToSize(data.get("observacoes") || "", 180);
  doc.text(obs, 14, y);
  y += obs.length * 6 + 8;

  // Resumo
  sectionTitle("Resumo", "📌");
  const comentario = doc.splitTextToSize(data.get("comentario") || "", 180);
  doc.text(comentario, 14, y); 
  y += comentario.length * 6 + 8;
  boxText("Próxima visita", data.get("proxima"));

  // ======== FOTOS ========
  const files = document.getElementById("fotos").files;
  if(files.length > 0) {
    doc.addPage();
    doc.setFillColor(156,39,176);
    doc.rect(0, 10, 210, 12, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(14);
    doc.text("📷 Registro Fotográfico", 105, 18, { align: "center" });

    let x = 14, imgY = 30;
    for(let i=0; i<files.length; i++) {
      const imgData = await toBase64Compressed(files[i]);
      doc.addImage(imgData, "JPEG", x, imgY, 90, 70);
      x += 95;
      if(x > 180) {
        x = 14;
        imgY += 80;
      }
      if(imgY > 220 && i < files.length-1) {
        doc.addPage();
        imgY = 30;
        x = 14;
      }
    }
  }

  // ======== RODAPÉ ========
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200);
    doc.line(14, 285, 196, 285);
    doc.setFontSize(10);
    doc.setTextColor(100);
    const now = new Date().toLocaleString("pt-BR");
    doc.text(`Relatório gerado por Beta Arquitetura e Engenharia | ${now}`, 105, 292, { align: "center" });
  }

  // Abrir PDF no iOS (PWA)
  const pdfData = doc.output("bloburl");
  location.href = pdfData;
});

// Funções auxiliares
function toBase64Compressed(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
    reader.onerror = error => reject(error);
  });
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
  });
}