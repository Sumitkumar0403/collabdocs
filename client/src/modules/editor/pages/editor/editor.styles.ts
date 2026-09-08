export const editorStyles = {
  container: 'min-h-screen bg-slate-100/70 flex flex-col',
  topHeader: 'sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between',
  leftActions: 'flex items-center gap-4 flex-1',
  backBtn: 'p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1 text-sm font-medium',
  titleInput: 'text-lg font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none px-1.5 py-0.5 max-w-sm sm:max-w-md truncate transition',
  rightActions: 'flex items-center gap-3',
  saveIndicator: 'flex items-center gap-1.5 text-xs font-medium',
  shareBtn: 'px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-sm shadow-sky-600/20 transition flex items-center gap-1.5',
  toolbarWrapper: 'sticky top-[57px] z-20 bg-slate-50/90 backdrop-blur-sm px-6 py-2 border-b border-slate-200/60 flex items-center justify-center',
  editorContainer: 'flex-1 max-w-4xl w-full mx-auto my-8 px-4 sm:px-6',
  paper: 'bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-10 sm:p-14 min-h-[700px]',
} as const;
