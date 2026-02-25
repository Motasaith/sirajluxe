"use client";

import { Bold, Italic, Strikethrough, List, ListOrdered, Link2, Heading2, Code, Undo, Redo } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder = "Write something..." }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[120px] px-4 py-3 focus:outline-none text-gray-300",
      },
    },
  });

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active ? "bg-violet-500/20 text-violet-400" : "text-gray-500 hover:text-white hover:bg-white/[0.05]"
    }`;

  return (
    <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#0d0d12]">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b border-white/[0.06] bg-[#0a0a0f]">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive("strike"))}>
          <Strikethrough className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-white/[0.06] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>
          <ListOrdered className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive("codeBlock"))}>
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={btnClass(editor.isActive("link"))}
        >
          <Link2 className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-white/[0.06] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors">
          <Undo className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors">
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
