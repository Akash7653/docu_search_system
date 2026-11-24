import { useEffect, useState } from 'react'

import DocumentForm from './DocumentForm'
import StatusMessage from './StatusMessage'
import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '../services/api'

function DocumentManager() {
  const [documents, setDocuments] = useState([])
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadDocuments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await listDocuments()
      setDocuments(response.items)
    } catch (requestError) {
      setError(requestError.message || 'Documents could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadDocuments)
  }, [])

  const openDocument = async (id) => {
    setError('')
    try {
      setSelected(await getDocument(id))
    } catch (requestError) {
      setError(requestError.message || 'Document could not be opened.')
    }
  }

  const handleSave = async (values) => {
    setSaving(true)
    setError('')
    try {
      const saved = editing
        ? await updateDocument(editing._id || editing.id, values)
        : await createDocument(values)
      setDocuments((current) => {
        const id = saved._id || saved.id
        const withoutSaved = current.filter((item) => (item._id || item.id) !== id)
        return [saved, ...withoutSaved]
      })
      setSelected(saved)
      setEditing(null)
      setShowForm(false)
    } catch (requestError) {
      setError(requestError.message || 'Document could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (document) => {
    const id = document._id || document.id
    if (!window.confirm(`Delete “${document.name}”? This cannot be undone.`)) return
    setError('')
    try {
      await deleteDocument(id)
      setDocuments((current) => current.filter((item) => (item._id || item.id) !== id))
      if ((selected?._id || selected?.id) === id) setSelected(null)
    } catch (requestError) {
      setError(requestError.message || 'Document could not be deleted.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Knowledge library</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Manage documents</h2>
          <p className="mt-2 text-sm text-slate-500">Create, review, update, and remove the documents your team searches.</p>
        </div>
        <button type="button" onClick={() => { setEditing(null); setShowForm(true) }} className="button-primary">+ New document</button>
      </div>
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {showForm && (
        <div className="panel p-5 sm:p-7">
          <div className="mb-5">
            <p className="text-lg font-bold text-slate-950">{editing ? 'Edit document' : 'Create a document'}</p>
            <p className="mt-1 text-sm text-slate-500">Keep the title and description specific so search results stay useful.</p>
          </div>
          <DocumentForm key={editing ? (editing._id || editing.id) : 'new'} document={editing} loading={saving} onCancel={() => { setShowForm(false); setEditing(null) }} onSubmit={handleSave} />
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">All documents</p>
              <p className="mt-1 text-xs text-slate-400">{documents.length} documents in your library</p>
            </div>
            <button type="button" onClick={loadDocuments} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Refresh</button>
          </div>
          {loading ? <div className="p-8"><StatusMessage type="loading">Loading your library...</StatusMessage></div> : documents.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No documents yet. Create your first one.</p> : (
            <div className="divide-y divide-slate-100">
              {documents.map((document) => {
                const id = document._id || document.id
                const active = (selected?._id || selected?.id) === id
                return (
                  <button type="button" key={id} onClick={() => openDocument(id)} className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-blue-50/50 ${active ? 'bg-blue-50' : ''}`}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{document.name}</span>
                      <span className="mt-1 block text-xs text-slate-500">{document.category}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-slate-400">Open →</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="panel min-h-64 p-5 sm:p-6">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="badge">{selected.category}</span>
                  <h3 className="mt-3 text-xl font-bold text-slate-950">{selected.name}</h3>
                </div>
                <button type="button" onClick={() => { setEditing(selected); setShowForm(true) }} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{selected.description}</p>
              <div className="my-5 h-px bg-slate-100" />
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{selected.content}</p>
              <button type="button" onClick={() => handleDelete(selected)} className="mt-6 text-sm font-semibold text-red-600 hover:text-red-700">Delete document</button>
            </>
          ) : <div className="flex h-full min-h-56 flex-col items-center justify-center text-center"><div className="mb-3 text-3xl">⌁</div><p className="font-semibold text-slate-800">Select a document</p><p className="mt-1 max-w-xs text-sm text-slate-500">Choose a document from the library to read its full content.</p></div>}
        </div>
      </div>
    </section>
  )
}

export default DocumentManager
