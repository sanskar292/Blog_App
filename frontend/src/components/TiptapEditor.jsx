import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextAlign } from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import "./TiptapEditor.css";

const TiptapEditor = ({ value, onChange, placeholder = "Write your story…", theme = "blog" }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"],
        fonts: [
          "DM Sans",
          "Instrument Serif",
          "Montserrat",
          "Cormorant Garamond",
          "Georgia",
          "Times New Roman",
          "Arial",
          "Courier New",
        ],
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: theme === "article" ? ["left"] : ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.state.selection.empty && !editor.isActive("link")) {
        setShowLinkInput(false);
      }
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor-content ${theme}-theme`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const openLinkMenu = () => {
    if (editor.state.selection.empty && !editor.isActive("link")) return;
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setShowLinkInput(true);
    editor.chain().focus().run();
  };

  const applyLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      // Ensure the URL is global
      let url = linkUrl;
      // Check if it already has a protocol or starts with common prefixes
      if (!/^(?:[a-z+]+:)?\/\//i.test(url) && 
          !url.startsWith("/") && 
          !url.startsWith("#") && 
          !url.startsWith("mailto:") && 
          !url.startsWith("tel:")) {
        url = `https://${url}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setShowLinkInput(false);
  };

  const isArticle = theme === "article";

  return (
    <div className={`tiptap-editor-wrapper ${theme}-theme`}>
      {isArticle && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ 
            duration: 100, 
            onHide: () => setShowLinkInput(false)
          }}
          shouldShow={() => showLinkInput}
        >
          <div className="tiptap-link-bubble">
            <input
              type="text"
              placeholder="Paste or type a link..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
              autoFocus
            />
            <button type="button" onClick={applyLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </BubbleMenu>
      )}

      <div className="tiptap-toolbar">
        {/* Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          title="Bold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          title="Italic"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="4" x2="10" y2="4"/>
            <line x1="14" y1="20" x2="5" y2="20"/>
            <line x1="15" y1="4" x2="9" y2="20"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
          title="Strikethrough"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4H9a3 3 0 0 0-2.83 4"/>
            <path d="M14 12a4 4 0 0 1 0 8H6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          title="Underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
            <line x1="4" y1="21" x2="20" y2="21"/>
          </svg>
        </button>

        {isArticle && (
          <button
            type="button"
            onClick={openLinkMenu}
            className={editor.isActive("link") ? "is-active" : ""}
            title="Link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
        )}

        {!isArticle && (
          <>
            <div className="toolbar-divider"></div>
            <select
              value={editor.getAttributes("textStyle").fontFamily || ""}
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              className="font-family-select"
              title="Font Family"
            >
              <option value="">Default Font</option>
              <option value="DM Sans">DM Sans</option>
              <option value="Instrument Serif">Instrument Serif</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Cormorant Garamond">Cormorant Garamond</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
            </select>
          </>
        )}

        {!isArticle && (
          <>
            <div className="toolbar-divider"></div>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
              title="Align Left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="15" y2="12"/>
                <line x1="3" y1="18" x2="18" y2="18"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
              title="Align Center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="6" y1="12" x2="18" y2="12"/>
                <line x1="5" y1="18" x2="19" y2="18"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
              title="Align Right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="9" y1="12" x2="21" y2="12"/>
                <line x1="6" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={editor.isActive({ textAlign: "justify" }) ? "is-active" : ""}
              title="Justify"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </>
        )}

        <div className="toolbar-divider"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
          title="Heading 1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12h8"/>
            <path d="M4 18V6"/>
            <path d="M12 18V6"/>
            <path d="M17 12l3-6v12"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
          title="Heading 2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12h8"/>
            <path d="M4 18V6"/>
            <path d="M12 18V6"/>
            <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>
          </svg>
        </button>
        <div className="toolbar-divider"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          title="Bullet List"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="9" y1="6" x2="20" y2="6"/>
            <line x1="9" y1="12" x2="20" y2="12"/>
            <line x1="9" y1="18" x2="20" y2="18"/>
            <circle cx="4" cy="6" r="1" fill="currentColor"/>
            <circle cx="4" cy="12" r="1" fill="currentColor"/>
            <circle cx="4" cy="18" r="1" fill="currentColor"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          title="Ordered List"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"/>
            <line x1="10" y1="12" x2="21" y2="12"/>
            <line x1="10" y1="18" x2="21" y2="18"/>
            <path d="M4 6h1v4"/>
            <path d="M4 10h2"/>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
          </svg>
        </button>
        <div className="toolbar-divider"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          title="Blockquote"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
          title="Code Block"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
        </button>
        <div className="toolbar-divider"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6"/>
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 3.7"/>
          </svg>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;