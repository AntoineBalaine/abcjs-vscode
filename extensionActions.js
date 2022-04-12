const vscode = require("vscode");
const {
  transposeHalfStepDownTransform,
  transposeHalfStepUpTransform,
  octaviateUpTransform,
  divideLengthTransform,
  convertToRestTransform,
  octaviateDownTransform,
  duplicateLengthTransform,
  convertToEnharmoniaTransform,
  consolidateConsecutiveNotesTransform,
  dispatcher,
  reorderChord,
  transposeStepUpTransform,
  transposeStepDownTransform,
  separateHeaderAndBody,
  findInstrumentCalls,
  addNomenclatureToHeader,
  buildBodyFromInstruments,
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
    /*     let newText = dispatcher(
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
    const newText = dispatcher(selectionContent(), { pos: 0 }, (note) =>
      key
        ? // @ts-ignore
          convertToEnharmoniaTransform(note, key)
        : convertToEnharmoniaTransform(note)
    );
    makeReplacement(newText);
  }
);
const convertToRest = vscode.commands.registerCommand(
  "abcjs-vscode.convertToRest",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      convertToRestTransform
    );
    makeReplacement(newText);
  }
);
const duplicateLength = vscode.commands.registerCommand(
  "abcjs-vscode.duplicateLength",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      duplicateLengthTransform
    );
    makeReplacement(newText);
  }
);
const divideLength = vscode.commands.registerCommand(
  "abcjs-vscode.divideLength",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      divideLengthTransform
    );
    makeReplacement(newText);
  }
);
const transposeHalfStepUp = vscode.commands.registerCommand(
  "abcjs-vscode.transposeHalfStepUp",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      transposeHalfStepUpTransform
    );
    makeReplacement(newText);
  }
);
const transposeHalfStepDown = vscode.commands.registerCommand(
  "abcjs-vscode.transposeHalfStepDown",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      transposeHalfStepDownTransform
    );
    makeReplacement(newText);
  }
);
const transposeOctDown = vscode.commands.registerCommand(
  "abcjs-vscode.transposeOctDown",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      octaviateDownTransform
    );
    makeReplacement(newText);
  }
);
const transposeStepUp = vscode.commands.registerCommand(
  "abcjs-vscode.transposeStepUp",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      transposeStepUpTransform
    );
    makeReplacement(newText);
  }
);
const transposeStepDown = vscode.commands.registerCommand(
  "abcjs-vscode.transposeStepDown",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      transposeStepDownTransform
    );
    makeReplacement(newText);
  }
);
const transposeOctUp = vscode.commands.registerCommand(
  "abcjs-vscode.transposeOctUp",
  () => {
    let newText = dispatcher(
      selectionContent(),
      { pos: 0 },
      octaviateUpTransform
    );
    makeReplacement(newText);
  }
);
const reorderChordNotes = vscode.commands.registerCommand(
  "abcjs-vscode.reorderChordNotes",
  () => {
    // @ts-ignore
    let newText = reorderChord(selectionContent());
    makeReplacement(newText);
  }
);

const createInstrumentsFile = vscode.commands.registerCommand(
  "abcjs-vscode.createInstrumentsFile",
  async () => {
    const currentFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
    const fileName = path.parse(currentFilePath).name;
    const directoryPath = path.dirname(currentFilePath);

    //create file's contents
    //pass in the full document
    //findInstrumentCalls()
    let headerAndBody = separateHeaderAndBody(
      vscode.window.activeTextEditor.document.getText(),
      { pos: 0 }
    );
    const parsedInstrumentFamilies = findInstrumentCalls(
      headerAndBody.bodyText,
      { pos: 0 }
    );
    headerAndBody.headerText = addNomenclatureToHeader(
      headerAndBody.headerText,
      parsedInstrumentFamilies.map((instrument) => Object.keys(instrument)[0])
    );
    headerAndBody.bodyText = buildBodyFromInstruments(parsedInstrumentFamilies);
    const newPath = path.join(
      directoryPath,
      `${fileName}.instrumentFamilies.abc`
    );
    await fs.writeFile(
      newPath,
      Object.values(headerAndBody).join("\n"),
      () => {}
    );

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
};
