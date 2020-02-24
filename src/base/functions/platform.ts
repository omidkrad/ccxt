// There's been a lot of messing with this code...
// The problem is to satisfy the following requirements:
// - properly detect isNode == true on server side and isNode == false in the browser (on client side)
// - make sure create-react-app, react-starter-kit and other react frameworks work
// - make sure it does not break the browserified version (when linked into a html from a cdn)
// - make sure it does not break the webpacking and babel-transpiled scripts
// - make sure it works in Electron
// - make sure it works with Angular.js
// - make sure it does not break other possible usage scenarios

export const isBrowser = typeof window !== 'undefined'

export const isElectron = typeof process !== 'undefined' &&
                   typeof process.versions !== 'undefined' &&
                   typeof process.versions.electron !== 'undefined'

export const isWebWorker = typeof WorkerGlobalScope !== 'undefined' && (self instanceof WorkerGlobalScope)

export const isWindows = typeof process !== 'undefined' && process.platform === "win32"

export const isNode = !(isBrowser || isWebWorker)

export const defaultFetch = typeof (fetch) === "undefined" ? require ('../../static_dependencies/fetch-ponyfill/fetch-node') ().fetch : fetch
