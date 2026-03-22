"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let timeout = undefined;
function activate(context) {
    console.log('A11y Assistant Funcionando.');
    if (vscode.window.activeTextEditor) {
        const doc = vscode.window.activeTextEditor.document;
        if (isFileExtensionValid(doc)) {
            imagesWithNoAltTextValidation(doc);
        }
    }
    const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
        const document = event.document;
        if (isFileExtensionValid(document)) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                imagesWithNoAltTextValidation(document);
            }, 500);
        }
    });
    context.subscriptions.push(documentChangeEvent);
}
function deactivate() {
    if (timeout) {
        clearTimeout(timeout);
    }
}
function isFileExtensionValid(document) {
    return document.languageId === 'html' || document.languageId === 'css';
}
function imagesWithNoAltTextValidation(document) {
    const text = document.getText();
    // Regex ampla para capturar TODAS as tags <img>, independente do conteúdo
    const regexTagImg = /<img[^>]*>/gi;
    // Regex específica para validar se o 'alt' existe e TEM CONTEÚDO (independente da ordem dos atributos)
    const regexValidAlt = /<img\s+(?=[^>]*?\balt=["'](?!\s*["'])[^"']+?["'])[^>]*?>/i;
    let match;
    while ((match = regexTagImg.exec(text)) !== null) {
        const entireTag = match[0];
        const hasValidAlt = regexValidAlt.test(entireTag);
        if (!hasValidAlt) {
            const inicioScan = document.positionAt(match.index);
            console.log(`Erro de Acessibilidade na Linha ${inicioScan.line + 1}: Tag <img> sem atributo 'alt' ou com 'alt' vazio.`);
        }
        else {
            console.log("Alt sendo utilizado!");
        }
    }
}
//# sourceMappingURL=extension.js.map