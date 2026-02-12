// 1. INICIALIZAÇÃO DO EDITOR
const editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    mode: "text/x-csrc",
    theme: "dracula",
    lineNumbers: true,
    autoCloseBrackets: true,
});

// 2. CÓDIGO PADRÃO (Para quando o site abrir pela primeira vez)
const codigoPadrao = `#include <stdio.h>

int main() {
    int idade;
    printf("Digite sua idade: ");
    scanf("%d", &idade);
    printf("Voce tem %d anos!\\n", idade);
    return 0;
}`;

// 3. LÓGICA DE CARREGAMENTO (Código e Tema)
window.addEventListener("DOMContentLoaded", () => {
    // Carrega o código salvo ou o padrão
    const salvo = localStorage.getItem("c_editor_code");
    if (salvo && salvo.trim() !== "") {
        editor.setValue(salvo);
    } else {
        editor.setValue(codigoPadrao);
    }

    // Carrega o tema salvo
    const temaSalvo = localStorage.getItem("theme");
    if (temaSalvo === "light") {
        document.body.classList.add("light-mode");
        editor.setOption("theme", "default");
    }
});

// 4. SALVAMENTO AUTOMÁTICO (Sempre que digitar)
editor.on("change", () => {
    const code = editor.getValue();
    localStorage.setItem("c_editor_code", code);
});

// 5. BOTÃO RODAR (RUN)
const runBtn = document.getElementById("run-btn");
const outputFrame = document.getElementById("output");
const stdinFrame = document.getElementById("stdin-input");

runBtn.addEventListener("click", async () => {
    const code = editor.getValue();
    const inputData = stdinFrame.value;
    
    outputFrame.innerText = "Executando...";
    outputFrame.style.color = "green";

    try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            body: JSON.stringify({
                language: "c",
                version: "10.2.0",
                files: [{ content: code }],
                stdin: inputData,
            }),
        });

        const result = await response.json();
        outputFrame.innerText = result.run.output || result.run.stderr || "Sucesso (sem saída).";
        
        if (result.run.stderr) outputFrame.style.color = "#ff5555";
    } catch (error) {
        outputFrame.innerText = "Erro na conexão.";
    }
});

// 6. ALTERNAR TEMA
document.getElementById("theme-btn").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    editor.setOption("theme", isLight ? "default" : "dracula");
    localStorage.setItem("theme", isLight ? "light" : "dark");
});

// 7. DOWNLOAD
document.getElementById("download-btn").addEventListener("click", () => {
    const blob = new Blob([editor.getValue()], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codigo.c";
    a.click();
    window.URL.revokeObjectURL(url);
});

// 8. UPLOAD
const fileInput = document.getElementById("file-input");
document.getElementById("upload-btn").addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => editor.setValue(e.target.result);
    reader.readAsText(file);
    event.target.value = "";
});

// 9. RESPONSIVIDADE (Ajuste do editor ao redimensionar)
window.addEventListener('resize', () => {
    editor.refresh();
});