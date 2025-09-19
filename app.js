document.getElementById("gerarPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Logo centralizado
  const logo = await loadImage("logoapp.png");
  doc.addImage(logo, "PNG", 80, 10, 50, 50);

  // Faixa roxa título
  doc.setFillColor(156,39,176);
  doc.rect(0, 65, 210, 15, "F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(16);
  doc.text("Relatório de Visita de Obra", 105, 75, { align: "center" });

  const form = document.getElementById("visitaForm");
  const data = new FormData(form);
  let y = 90;

  const sectionTitle = (text) => {
    doc.setFillColor(156,39,176);
    doc.rect(14, y, 182, 8, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(12);
    doc.text(text, 16, y+6);
    y += 14;
    doc.setTextColor(0);
  };

  const addLine = (label, value) => {
    if(value) {
      doc.setFontSize(11);
      doc.text(`${label}: ${value}`, 14, y);
      y += 8;
    }
  };

  sectionTitle("Informações Gerais");
  addLine("Data da visita", data.get("data"));
  addLine("Responsável", data.get("responsavel"));
  addLine("Cliente", data.get("cliente"));
  addLine("Obra", data.get("obra"));

  sectionTitle("Status da Obra");
  addLine("Etapa", data.get("etapa"));
  addLine("Percentual concluído", data.get("percentual") + "%");
  const checklist = data.getAll("checklist").join(", ");
  addLine("Checklist", checklist);

  sectionTitle("Observações Técnicas");
  const obs = doc.splitTextToSize(data.get("observacoes") || "", 180);
  doc.text(obs, 14, y); y += obs.length * 6 + 4;

  sectionTitle("Resumo");
  const comentario = doc.splitTextToSize(data.get("comentario") || "", 180);
  doc.text(comentario, 14, y); y += comentario.length * 6 + 4;
  addLine("Próxima visita", data.get("proxima"));

  const files = document.getElementById("fotos").files;
  if(files.length > 0) {
    doc.addPage();
    doc.setFillColor(156,39,176);
    doc.rect(0, 10, 210, 12, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(14);
    doc.text("Registro Fotográfico", 105, 18, { align: "center" });
    y = 30;

    for(let i=0; i<files.length; i++) {
      const imgData = await toBase64Compressed(files[i]);
      doc.addImage(imgData, "JPEG", 14, y, 90, 70);
      y += 80;
      if(y > 250 && i < files.length-1) {
        doc.addPage();
        y = 30;
      }
    }
  }

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Relatório gerado por Beta ArqEng", 105, 290, { align: "center" });

  const pdfData = doc.output("bloburl");
  window.open(pdfData, "_blank");
});

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