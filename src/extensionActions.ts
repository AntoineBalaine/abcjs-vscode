const vscode = require("vscode");
import {
  consolidateConsecutiveNotesTransform,
  convertToEnharmoniaTransform,
  convertToRestTransform,
  createInstrumentationRoutine,
  divideLengthTransform,
  duplicateLengthTransform,
  noteDispatcher,
  octaviateDownTransform,
  octaviateUpTransform,
  reorderChordTransform,
  transposeHalfStepDownTransform,
  transposeHalfStepUpTransform,
  transposeStepDownTransform,
  transposeStepUpTransform,
  formatLineSystem,
} from "abc-editing-macros";
const fs = require("fs");
const path = require("path");

const selectionContent = () =>
  vscode.window.activeTextEditor.document.getText(
    vscode.window.activeTextEditor.selection
  );

const makeReplacement = (newText: string) => {
  vscode.window.activeTextEditor.edit((editBuilder: any) => {
    editBuilder.replace(vscode.window.activeTextEditor.selection, newText);
  });
};

export const consolidateConsecutiveNotes = vscode.commands.registerCommand(
  "abcjs-vscode.consolidateConsecutiveNotes",
  () => {
    let newText = consolidateConsecutiveNotesTransform(selectionContent());
    /*     let newText = noteDispatcher(
      selectionContent(),
      { pos: 0 },
      consolidateConsecutiveNotesTransform
    ); */
    makeReplacement(newText);
  }
);
export const convertToEnharmonia = vscode.commands.registerCommand(
  "abcjs-vscode.convertToEnharmonia",
  () => {
    const matcher = /(^K:\s?[A-Z][b#]?)|(\[K:\s?[A-Z][b#]?[a-z]+?\])/;
    const position = vscode.window.activeTextEditor.selection.active.character;
    const text = vscode.window.activeTextEditor.document
      .getText()
      .substring(0, position);
    let keyArray = text.match(matcher);
    let key: any;
    if (keyArray && keyArray.length > 0) {
      keyArray = keyArray.filter((n: any) => n);
      key = keyArray.pop();
    }
    const newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: (note) =>
        key
          ? // @ts-ignore
            convertToEnharmoniaTransform(note, key)
          : convertToEnharmoniaTransform(note),
    });
    makeReplacement(newText);
  }
);
export const convertToRest = vscode.commands.registerCommand(
  "abcjs-vscode.convertToRest",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: convertToRestTransform,
    });
    makeReplacement(newText);
  }
);
export const duplicateLength = vscode.commands.registerCommand(
  "abcjs-vscode.duplicateLength",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: duplicateLengthTransform,
    });
    makeReplacement(newText);
  }
);
export const divideLength = vscode.commands.registerCommand(
  "abcjs-vscode.divideLength",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: divideLengthTransform,
    });
    makeReplacement(newText);
  }
);
export const transposeHalfStepUp = vscode.commands.registerCommand(
  "abcjs-vscode.transposeHalfStepUp",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: transposeHalfStepUpTransform,
    });
    makeReplacement(newText);
  }
);
export const transposeHalfStepDown = vscode.commands.registerCommand(
  "abcjs-vscode.transposeHalfStepDown",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: transposeHalfStepDownTransform,
    });
    makeReplacement(newText);
  }
);
export const transposeOctDown = vscode.commands.registerCommand(
  "abcjs-vscode.transposeOctDown",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: octaviateDownTransform,
    });
    makeReplacement(newText);
  }
);
export const transposeStepUp = vscode.commands.registerCommand(
  "abcjs-vscode.transposeStepUp",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: transposeStepUpTransform,
    });
    makeReplacement(newText);
  }
);

export const scoreFormatter = vscode.commands.registerCommand(
  "abcjs-vscode.scoreFormatter",
  () => {
    const text = selectionContent();
    const newText = formatLineSystem(0, text.length, text);
    makeReplacement(newText);
  }
);
export const transposeStepDown = vscode.commands.registerCommand(
  "abcjs-vscode.transposeStepDown",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: transposeStepDownTransform,
    });
    makeReplacement(newText);
  }
);
export const transposeOctUp = vscode.commands.registerCommand(
  "abcjs-vscode.transposeOctUp",
  () => {
    let newText = noteDispatcher({
      text: selectionContent(),
      context: { pos: 0 },
      transformFunction: octaviateUpTransform,
    });
    makeReplacement(newText);
  }
);
export const reorderChordNotes = vscode.commands.registerCommand(
  "abcjs-vscode.reorderChordTransformNotes",
  () => {
    // @ts-ignore
    let newText = reorderChordTransform(selectionContent());
    makeReplacement(newText);
  }
);

export const createInstrumentsFile = vscode.commands.registerCommand(
  "abcjs-vscode.createInstrumentsFile",
  async () => {
    const documentText = vscode.window.activeTextEditor.document.getText();
    const instrumentationRoutine = createInstrumentationRoutine(documentText);
    const currentFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
    const fileName = path.parse(currentFilePath).name;
    const directoryPath = path.dirname(currentFilePath);

    const newPath = path.join(
      directoryPath,
      `${fileName}.instrumentFamilies.abc`
    );
    await fs.writeFile(newPath, instrumentationRoutine, () => {});

    const newURI = vscode.Uri.parse(newPath);
    vscode.window.showTextDocument(newURI);
  }
);
