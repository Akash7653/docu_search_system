import { useState } from 'react'

const emptyDocument = {
  name: '',
  category: '',
  description: '',
  content: '',
}

function DocumentForm({ document, loading, onCancel, onSubmit }) {
  const [values, setValues] = useState(document || emptyDocument)

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Document name</span>
          <input required value={values.name} onChange={(event) => updateField('name', event.target.value)} className="field-input" placeholder="e.g. API Design Guide" />
        </label>
        <label className="block">
          <span className="field-label">Category</span>
          <input required value={values.category} onChange={(event) => updateField('category', event.target.value)} className="field-input" placeholder="e.g. Backend" />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Short description</span>
        <input required value={values.description} onChange={(event) => updateField('description', event.target.value)} className="field-input" placeholder="What is this document about?" />
      </label>
      <label className="block">
        <span className="field-label">Content</span>
        <textarea required rows="8" value={values.content} onChange={(event) => updateField('content', event.target.value)} className="field-input resize-y" placeholder="Write the document content here..." />
      </label>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="button-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="button-primary">{loading ? 'Saving...' : document ? 'Save changes' : 'Create document'}</button>
      </div>
    </form>
  )
}

export default DocumentForm
