const vscode = require("vscode");
const {
  consolidateConsecutiveNotesTransform,
  consolidateRestsInRoutine,
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
} = require("abc-editing-macros");
const fs = require("fs");
const path = require("path");

const selectionContent = () =>
  vscode.window.activeTextEditor.document.getText(
    vscode.window.activeTextEditor.selection
  );

const makeReplacement = (newText) => {
  vscode.window.activeTextEditor.edit((editBuilder) => {
    editBuilder.replace(vscode.window.activeTextEditor.selection, newText);
  });
};

const consolidateConsecutiveNotes = vscode.commands.registerCommand(
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
const convertToEnharmonia = vscode.commands.registerCommand(
  "abcjs-vscode.convertToEnharmonia",
  () => {
    const matcher = /(^K:\s?[A-Z][b#]?)|(\[K:\s?[A-Z][b#]?[a-z]+?\])/;
    const position = vscode.window.activeTextEditor.selection.active.character;
    const text = vscode.window.activeTextEditor.document
      .getText()
      .substring(0, position);
    let keyArray = text.match(matcher);
    let key;
    if (keyArray && keyArray.length > 0) {
      keyArray = keyArray.filter((n) => n);
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
const convertToRest = vscode.commands.registerCommand(
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
const duplicateLength = vscode.commands.registerCommand(
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
const divideLength = vscode.commands.registerCommand(
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
const transposeHalfStepUp = vscode.commands.registerCommand(
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
const transposeHalfStepDown = vscode.commands.registerCommand(
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
const transposeOctDown = vscode.commands.registerCommand(
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
const transposeStepUp = vscode.commands.registerCommand(
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

const scoreFormatter = vscode.commands.registerCommand(
  "abcjs-vscode.scoreFormatter",
  () => {
    const text = selectionContent();
    const newText = formatLineSystem(0, text.length, text);
    makeReplacement(newText);
  }
);
const transposeStepDown = vscode.commands.registerCommand(
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
const transposeOctUp = vscode.commands.registerCommand(
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
const reorderChordNotes = vscode.commands.registerCommand(
  "abcjs-vscode.reorderChordTransformNotes",
  () => {
    // @ts-ignore
    let newText = reorderChordTransform(selectionContent());
    makeReplacement(newText);
  }
);

const createInstrumentsFile = vscode.commands.registerCommand(
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

module.exports = {
  consolidateConsecutiveNotes,
  convertToEnharmonia,
  convertToRest,
  divideLength,
  duplicateLength,
  transposeHalfStepDown,
  transposeHalfStepUp,
  transposeOctDown,
  transposeOctUp,
  transposeStepDown,
  transposeStepUp,
  reorderChordNotes,
  createInstrumentsFile,
  scoreFormatter,
};
