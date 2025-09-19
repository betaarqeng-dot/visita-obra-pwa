document.getElementById("gerarPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(156, 39, 176);
  doc.text("Relatório de Visita de Obra - Beta ArqEng", 14, 20);

  const form = document.getElementById("visitaForm");
  const data = new FormData(form);

  let y = 30;
  const addLine = (label, value) => {
    if(value) {
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`${label}: ${value}`, 14, y);
      y += 8;
    }
  };

  addLine("Data da visita", data.get("data"));
  addLine("Responsável", data.get("responsavel"));
  addLine("Cliente", data.get("cliente"));
  addLine("Obra", data.get("obra"));
  addLine("Etapa", data.get("etapa"));
  addLine("Percentual concluído", data.get("percentual") + "%");

  const checklist = data.getAll("checklist").join(", ");
  addLine("Checklist", checklist);

  doc.text("Observações:", 14, y); y += 6;
  const obs = doc.splitTextToSize(data.get("observacoes") || "", 180);
  doc.text(obs, 14, y); y += obs.length * 6 + 4;

  doc.text("Comentário final:", 14, y); y += 6;
  const comentario = doc.splitTextToSize(data.get("comentario") || "", 180);
  doc.text(comentario, 14, y); y += comentario.length * 6 + 4;

  addLine("Próxima visita", data.get("proxima"));

  const files = document.getElementById("fotos").files;
  if(files.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(156,39,176);
    doc.text("Registro Fotográfico", 14, 20);
    y = 40;
    for(let i=0; i<files.length; i++) {
      const file = files[i];
      const imgData = await toBase64(file);
      doc.addImage(imgData, "JPEG", 14, y, 80, 60);
      y += 70;
      if(y > 250 && i < files.length-1) {
        doc.addPage();
        y = 30;
      }
    }
  }

  const pdfData = doc.output("bloburl");
  window.open(pdfData, "_blank");
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}