"use client";

import { type Editor } from "@tiptap/react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  Rows3,
  Columns3,
  Trash2,
  Merge,
  Split,
  Heading,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TableControlsProps {
  editor: Editor | null;
}

const MAX_ROWS = 10;
const MAX_COLS = 10;
const DEFAULT_SIZE = 3;

export function TableControls({ editor }: TableControlsProps) {
  const [isInsertOpen, setIsInsertOpen] = useState(false);
  const [hoveredRows, setHoveredRows] = useState(DEFAULT_SIZE);
  const [hoveredCols, setHoveredCols] = useState(DEFAULT_SIZE);

  if (!editor) return null;

  const isInTable = editor.isActive("table");

  const handleInsertTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setIsInsertOpen(false);
    setHoveredRows(DEFAULT_SIZE);
    setHoveredCols(DEFAULT_SIZE);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Insert Table Dropdown */}
        <DropdownMenu open={isInsertOpen} onOpenChange={setIsInsertOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                isInTable && "bg-muted text-muted-foreground",
                "hidden sm:inline-flex"
              )}
            >
              <Table className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto p-4" align="start">
            <div className="space-y-3">
              <div className="text-sm font-medium">Insert Table</div>
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${MAX_COLS}, minmax(0, 1fr))`,
                }}
                onMouseLeave={() => {
                  setHoveredRows(DEFAULT_SIZE);
                  setHoveredCols(DEFAULT_SIZE);
                }}
              >
                {Array.from({ length: MAX_ROWS }, (_, rowIndex) =>
                  Array.from({ length: MAX_COLS }, (_, colIndex) => {
                    const row = rowIndex + 1;
                    const col = colIndex + 1;
                    const isHovered = row <= hoveredRows && col <= hoveredCols;
                    return (
                      <button
                        key={`${row}-${col}`}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-sm border transition-colors",
                          isHovered
                            ? "bg-primary border-primary"
                            : "bg-background border-border hover:bg-muted"
                        )}
                        onMouseEnter={() => {
                          setHoveredRows(row);
                          setHoveredCols(col);
                        }}
                        onClick={() => handleInsertTable(row, col)}
                        aria-label={`Insert ${row}x${col} table`}
                      />
                    );
                  })
                )}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {hoveredRows} × {hoveredCols} table
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Table Operations - Only visible when in table and on larger screens */}
        {isInTable && (
          <>
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

            {/* Row Operations */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  disabled={!editor.can().addRowBefore()}
                  className="hidden sm:inline-flex"
                >
                  <Rows3 className="size-4 rotate-180" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Row Before</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  disabled={!editor.can().addRowAfter()}
                  className="hidden sm:inline-flex"
                >
                  <Rows3 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Row After</TooltipContent>
            </Tooltip>

            {/* Column Operations */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  disabled={!editor.can().addColumnBefore()}
                  className="hidden sm:inline-flex"
                >
                  <Columns3 className="size-4 rotate-180" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Column Before</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  disabled={!editor.can().addColumnAfter()}
                  className="hidden sm:inline-flex"
                >
                  <Columns3 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Column After</TooltipContent>
            </Tooltip>

            {/* Delete Operations */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  disabled={!editor.can().deleteRow()}
                  className="hidden sm:inline-flex"
                >
                  <Rows3 className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Row</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  disabled={!editor.can().deleteColumn()}
                  className="hidden sm:inline-flex"
                >
                  <Columns3 className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Column</TooltipContent>
            </Tooltip>

            {/* Merge/Split */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().mergeCells().run()}
                  disabled={!editor.can().mergeCells()}
                  className="hidden md:inline-flex"
                >
                  <Merge className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Merge Cells</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().splitCell().run()}
                  disabled={!editor.can().splitCell()}
                  className="hidden md:inline-flex"
                >
                  <Split className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Split Cell</TooltipContent>
            </Tooltip>

            {/* Header Operations */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                  disabled={!editor.can().toggleHeaderRow()}
                  className={cn(
                    "hidden lg:inline-flex",
                    editor.isActive("tableHeader") && "bg-muted text-muted-foreground"
                  )}
                >
                  <Heading className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Header Row</TooltipContent>
            </Tooltip>

            {/* Delete Table */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  disabled={!editor.can().deleteTable()}
                  className="hidden sm:inline-flex"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Table</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
