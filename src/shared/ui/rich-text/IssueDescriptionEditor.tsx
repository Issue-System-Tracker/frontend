"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, type ReactNode } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Table2,
  Trash2,
  Plus,
} from "lucide-react";

interface IssueDescriptionEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-2 py-1 text-sm transition-colors disabled:opacity-40 ${
        active ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export function IssueDescriptionEditor({
  value,
  onChange,
  placeholder = "Описание задачи…",
  disabled = false,
  className = "",
}: IssueDescriptionEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TableKit.configure({
        table: { resizable: false },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "issue-description-editor-focus outline-none min-h-[120px]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const cur = editor.getHTML();
    if (value !== cur) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={`issue-description-editor flex min-h-[140px] animate-pulse rounded-md border border-gray-300 bg-gray-50 ${className}`}
      />
    );
  }

  const tableActive = editor.isActive("table");

  return (
    <div
      className={`issue-description-editor flex flex-col overflow-hidden rounded-md border border-gray-300 bg-white ${className}`}
    >
      {!disabled && (
        <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-1.5 py-1">
          <ToolbarButton
            title="Жирный"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            title="Курсив"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            title="Подчёркнутый"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            title="Зачёркнутый"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={16} />
          </ToolbarButton>
          <span className="mx-1 w-px self-stretch bg-gray-200" aria-hidden />
          <ToolbarButton
            title="Маркированный список"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            title="Нумерованный список"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </ToolbarButton>
          <span className="mx-1 w-px self-stretch bg-gray-200" aria-hidden />
          <ToolbarButton
            title="Вставить таблицу 3×3"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <Table2 size={16} />
          </ToolbarButton>
          {tableActive && (
            <>
              <ToolbarButton
                title="Добавить строку ниже"
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <Plus size={16} />
              </ToolbarButton>
              <ToolbarButton
                title="Добавить колонку справа"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <Plus size={16} className="rotate-90" />
              </ToolbarButton>
              <ToolbarButton
                title="Удалить таблицу"
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 size={16} />
              </ToolbarButton>
            </>
          )}
        </div>
      )}
      <EditorContent
        editor={editor}
        className="max-h-[min(320px,50vh)] overflow-y-auto px-3 py-2"
      />
    </div>
  );
}
