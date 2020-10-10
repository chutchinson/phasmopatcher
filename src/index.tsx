import React from "react"
import ReactDom from "react-dom"
import { useRef, useState } from "react"
import { load, patch, SaveFile } from "./patch"
import fileDownload from "js-file-download"

const fieldSchema: { [key: string]: any } = {
  'PlayersMoney': {
    min: 0,
    max: 250000
  }
}

function getFieldSchema(key: string) {
  if (key in fieldSchema) {
    return fieldSchema[key]
  }
  return {}
}

interface FieldEditorProps<T> {
  index: number,
  name: string,
  type: string,
  min?: number,
  max?: number,
  value: T
  onChange: (index: number, value: string) => void
}

function FieldEditor<T>(props: FieldEditorProps<T>) {
  const key = props.name
  const value = `${props.value}`
  const [inputValue, setInputValue] = useState(value)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }
  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(props.index, e.target.value)
  }
  return (
    <div className="field">
      <label>{key}</label>
      <input type={props.type} value={inputValue} 
        min={props.min} max={props.max}
        onChange={handleChange}
        onBlur={handleBlur} />
    </div>
  )
}

interface State {
  save: SaveFile,
  filename: string
}

function App() {
  const [state, setState] = useState<State>({
    save: { IntData: [], StringData: [] },
    filename: ''
  })
  const formRef = useRef<HTMLFormElement>(null)

  console.log('render app')

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files!)
    const file = files[0]
    const save = await load(file)
    setState({
      save,
      filename: file.name
    })
  }

  const handleClickSave = async () => {
    const blob = await patch(state.save)
    fileDownload(blob, "saveData.txt")
  }
  
  const handleChangeString = (index: number, value: string) => {
    const save = { ...state.save }
    save.StringData[index].Value = value
    setState((state) => ({
      filename: state.filename,
      save,
    }))
  }

  const handleChangeNumber = (index: number, value: string) => {
    const save = {...state.save}
    save.IntData[index].Value = parseInt(value) || 0
    setState((state) => ({
      filename: state.filename,
      save,
    }))
  }

  const strings = state.save.StringData.map((field, index) => {
    return (
      <FieldEditor
        key={field.Key}
        type="text"
        index={index}
        name={field.Key}
        value={field.Value}
        onChange={handleChangeString}
      />
    )
  })

  const numbers = state.save.IntData.map((field, index) => {
    const schema = getFieldSchema(field.Key)
    return (
      <FieldEditor
        key={field.Key}
        type="number"
        index={index}
        name={field.Key}
        value={field.Value}
        min={schema.min} max={schema.max}
        onChange={handleChangeNumber}
      />
    )
  })

  const isSaveValid = formRef.current ? formRef.current.checkValidity() : true

  return (
    <>
      <header>
        <h1>Phasmopatcher</h1>
        <p>
          <strong>Windows:</strong>
          <span>%USERPROFILE%\AppData\LocalLow\Kinetic Games\Phasmophobia\saveData.txt</span>
        </p>
        <input type="file" accept="text/plain" onChange={handleLoad} />
        <button onClick={handleClickSave} disabled={!isSaveValid}>Save</button>
      </header>
      <form key={state.filename} ref={formRef} className="editor">
        {strings}
        {numbers}
      </form>
    </>
  )
}

ReactDom.render(<App />, document.querySelector("main"))
