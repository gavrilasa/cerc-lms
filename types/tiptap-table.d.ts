declare module "@tiptap/core" {
  interface ChainedCommands {
    insertTable: (options?: {
      rows?: number;
      cols?: number;
      withHeaderRow?: boolean;
    }) => ChainedCommands;
    addColumnBefore: () => ChainedCommands;
    addColumnAfter: () => ChainedCommands;
    deleteColumn: () => ChainedCommands;
    addRowBefore: () => ChainedCommands;
    addRowAfter: () => ChainedCommands;
    deleteRow: () => ChainedCommands;
    deleteTable: () => ChainedCommands;
    toggleHeaderColumn: () => ChainedCommands;
    toggleHeaderRow: () => ChainedCommands;
    toggleHeaderCell: () => ChainedCommands;
    mergeCells: () => ChainedCommands;
    splitCell: () => ChainedCommands;
  }

  interface CanCommands {
    insertTable: (options?: {
      rows?: number;
      cols?: number;
      withHeaderRow?: boolean;
    }) => boolean;
    addColumnBefore: () => boolean;
    addColumnAfter: () => boolean;
    deleteColumn: () => boolean;
    addRowBefore: () => boolean;
    addRowAfter: () => boolean;
    deleteRow: () => boolean;
    deleteTable: () => boolean;
    toggleHeaderColumn: () => boolean;
    toggleHeaderRow: () => boolean;
    toggleHeaderCell: () => boolean;
    mergeCells: () => boolean;
    splitCell: () => boolean;
  }
}

export {};
