import { closeBrackets } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import {
  drawSelection,
  EditorView,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { useCallback, useEffect, useRef } from "react";

const HTML_DOCTYPE = /^<!doctype\s+html/i;
const HTML_TAG = /^<html[\s>]/i;
const CSS_BLOCK = /^[^/]*\{[\s\S]*\}/;
const BARE_JSX = /^<[A-Za-z]/;

function detectLanguage(code: string): Extension {
  const trimmed = code.trimStart();
  if (HTML_DOCTYPE.test(trimmed) || HTML_TAG.test(trimmed)) {
    return html();
  }
  if (
    CSS_BLOCK.test(trimmed) &&
    !trimmed.includes("import ") &&
    !trimmed.includes("export ") &&
    !trimmed.includes("function ") &&
    trimmed.includes("{") &&
    trimmed.includes(":")
  ) {
    return css();
  }
  return javascript({ jsx: true, typescript: true });
}

let prettierPromise: Promise<typeof import("prettier")> | null = null;
function loadPrettier() {
  if (!prettierPromise) {
    prettierPromise = import("prettier");
  }
  return prettierPromise;
}

function isBareJsx(code: string): boolean {
  const trimmed = code.trimStart();
  if (!BARE_JSX.test(trimmed)) {
    return false;
  }
  return !(HTML_DOCTYPE.test(trimmed) || HTML_TAG.test(trimmed));
}

async function formatCode(code: string): Promise<string> {
  const prettier = await loadPrettier();
  const trimmed = code.trimStart();
  const isHtml = HTML_DOCTYPE.test(trimmed) || HTML_TAG.test(trimmed);

  if (isHtml) {
    const htmlPlugin = await import("prettier/plugins/html");
    return prettier.format(code, {
      parser: "html",
      plugins: [htmlPlugin.default ?? htmlPlugin],
    });
  }

  const [babelPlugin, estreePlugin] = await Promise.all([
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
  ]);
  const plugins = [
    babelPlugin.default ?? babelPlugin,
    estreePlugin.default ?? estreePlugin,
  ];

  if (isBareJsx(code)) {
    const wrapped = `const __fmt = () => (\n${code}\n);\n`;
    const formatted = await prettier.format(wrapped, {
      parser: "babel-ts",
      plugins,
    });
    const start = formatted.indexOf("(\n") + 2;
    const end = formatted.lastIndexOf("\n);");
    if (start > 1 && end > start) {
      return formatted
        .slice(start, end)
        .split("\n")
        .map((line) => (line.startsWith("  ") ? line.slice(2) : line))
        .join("\n")
        .trimEnd()
        .concat("\n");
    }
    return code;
  }

  return prettier.format(code, { parser: "babel-ts", plugins });
}

const editorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      fontSize: "14px",
      backgroundColor: "#09090b", // zinc-950
    },
    ".cm-scroller": {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      overflow: "auto",
      scrollbarColor: "#27272a #09090b", // zinc-800 thumb, zinc-950 track
      scrollbarWidth: "thin",
    },
    ".cm-scroller::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    ".cm-scroller::-webkit-scrollbar-track": {
      background: "#09090b", // zinc-950
    },
    ".cm-scroller::-webkit-scrollbar-thumb": {
      background: "#27272a", // zinc-800
      borderRadius: "4px",
    },
    ".cm-scroller::-webkit-scrollbar-thumb:hover": {
      background: "#3f3f46", // zinc-700
    },
    ".cm-scroller::-webkit-scrollbar-corner": {
      background: "#09090b", // zinc-950
    },
    ".cm-gutters": {
      backgroundColor: "#09090b", // zinc-950
      borderRight: "1px solid #18181b", // zinc-900 (subtler)
      color: "#3f3f46", // zinc-700
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#18181b", // zinc-900
      color: "#71717a", // zinc-500
    },
    ".cm-activeLine": {
      backgroundColor: "#18181b80", // zinc-900/50
    },
    ".cm-line": {
      color: "#d4d4d8", // zinc-300
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#a1a1aa", // zinc-400
    },
    "& .cm-selectionBackground": {
      backgroundColor: "#3f3f46 !important",
    },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":
      {
        backgroundColor: "#3f3f46 !important",
      },
  },
  { dark: true }
);

interface CodeEditorProps {
  readonly code: string;
  readonly onChange: (code: string) => void;
  readonly vimMode?: boolean;
}

export function CodeEditor({
  code,
  onChange,
  vimMode = false,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const languageCompartment = useRef(new Compartment());
  const vimCompartment = useRef(new Compartment());
  const handleFormatRef = useRef<() => boolean>(null);

  onChangeRef.current = onChange;

  const handleFormat = useCallback(() => {
    const view = viewRef.current;
    if (!view) {
      return false;
    }
    const currentCode = view.state.doc.toString();
    if (!currentCode.trim()) {
      return true;
    }

    formatCode(currentCode).then((formatted) => {
      const v = viewRef.current;
      if (!v) {
        return;
      }
      if (formatted !== v.state.doc.toString()) {
        v.dispatch({
          changes: {
            from: 0,
            to: v.state.doc.length,
            insert: formatted,
          },
        });
        onChangeRef.current(formatted);
      }
    });

    return true;
  }, []);

  handleFormatRef.current = handleFormat;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const startState = EditorState.create({
      doc: "",
      extensions: [
        vimCompartment.current.of([]),
        lineNumbers(),
        drawSelection(),
        history(),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        syntaxHighlighting(oneDarkHighlightStyle),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        languageCompartment.current.of(
          javascript({ jsx: true, typescript: true })
        ),
        editorTheme,
        keymap.of([
          {
            key: "Mod-s",
            run: () => handleFormatRef.current?.() ?? false,
            preventDefault: true,
          },
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    const current = view.state.doc.toString();
    if (code !== current) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      });
    }
  }, [code]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    view.dispatch({
      effects: languageCompartment.current.reconfigure(detectLanguage(code)),
    });
  }, [code]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    view.dispatch({
      effects: vimCompartment.current.reconfigure(vimMode ? vim() : []),
    });
  }, [vimMode]);

  return <div className="h-full w-full" ref={containerRef} />;
}
