// forked from https://gist.github.com/marcelo-ribeiro/abd651b889e4a20e0bab558a05d38d77

const accentsMap = new Map([
  ['A', 'Á|À|Ã|Â|Ä|Å'],
  ['a', 'á|à|ã|â|ä|å'],
  ['E', 'É|È|Ê|Ë'],
  ['e', 'é|è|ê|ë'],
  ['I', 'Í|Ì|Î|Ï'],
  ['i', 'í|ì|î|ï'],
  ['O', 'Ó|Ò|Ô|Õ|Ö|Ø'],
  ['o', 'ó|ò|ô|õ|ö|ø'],
  ['U', 'Ú|Ù|Û|Ü'],
  ['u', 'ú|ù|û|ü'],
  ['C', 'Ç'],
  ['c', 'ç'],
  ['N', 'Ñ'],
  ['n', 'ñ'],
  ['ae', 'æ'],
  ['AE', 'Æ']
])

const reducer = (acc: string, [key]: any) =>
  acc.replace(new RegExp(accentsMap.get(key), 'g'), key)

const removeAccents = (text: string) => [...accentsMap].reduce(reducer, text)
export default removeAccents
