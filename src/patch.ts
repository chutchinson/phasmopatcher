
function scramble(data: string) {
  const key = "CHANGE ME TO YOUR OWN RANDOM STRING"
  const output = new Array(data.length)
  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    output[i] = String.fromCharCode(ch)
  }
  return output.join("")
}

export interface SaveFile {
  StringData: Array<{ Key: string; Value: string }>
  IntData: Array<{ Key: string; Value: number }>
}

export async function load(file: File): Promise<SaveFile> {
  const contents = await read(file)
  const json = scramble(contents)
  console.log(json)
  const data = JSON.parse(json) as SaveFile
  return data
}

export function patch(file: SaveFile): Blob {
  const content = scramble(JSON.stringify(file))
  return new Blob([content], { type: "text/plain;charset=utf-8" })
}

function read(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => resolve(ev.target!.result as string)
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}
