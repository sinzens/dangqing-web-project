import TextCollection from './plugins/textCollection'

export type Page
  = 'basicModel'
  | 'batchTable'
  | 'atdTable'
  | 'dtaTable'
  | 'settings'
  | 'about'
  | 'invalid'

export type Table = 'batchTable' | 'atdTable' | 'dtaTable' | 'invalid'
export type TableSource = 'batch' | 'path_1' | 'path_2' | 'invalid'
export type TableInputType = 'input' | 'select'
export type TableValueType = 'string' | 'number'

export type DataTableItem = BatchItem | AtdPathItem | DtaPathItem
export type DataTableItems = BatchItem[] | AtdPathItem[] | DtaPathItem[]

export type FormItemValue = string | number | string[] | number[]

export interface TabItem {
  header: string
  page: Page
}

export interface FormItem {
  label: string
  value: FormItemValue
  domain?: string[] | number[]
  rules?: ((value: FormItemValue) => boolean | string)[]
}

export interface DataTableHeader {
  text?: string
  value: string
  inputType?: TableInputType
  valueType?: TableValueType
  domain?: string[] | number[]
  rules?: ((value: FormItemValue) => boolean | string)[]
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  filterable?: boolean
  groupable?: boolean
  divider?: boolean
  class?: string | string[]
  cellClass?: string | string[]
  width?: string | number
  filter?: (value: any, search: string, item: any) => boolean
  sort?: (a: any, b: any) => number
}

export interface DataTableModel {
  headers: DataTableHeader[]
  keys: string[]
  itemModel: DataTableItem
  sortBy: string,
  tableName: Table,
  sourceName: TableSource
  converter?: (item: DataTableItem) => DataTableItem
  invertConverter?: (item: DataTableItem) => DataTableItem
  validate?: (item: DataTableItem) => boolean | Promise<boolean>
}

export interface DataTableBackup {
  identifier: string
  data: DataTableItems
}

export interface BatchItem {
  batchno: number
  arrialtime: number
  arrivalnum: number
  dropoff_no: string
  stand_no: number
  security_no: string
  sc_capacity: number
}

export interface AtdPathItem {
  area: string
  name: string
  destination: string
  path: string
}

export interface DtaPathItem {
  name: string
  content: string
  security_no: string
  areanumber: number
  path: string
}

declare module 'vue/types/vue' {
  interface Vue {
    $texts: typeof TextCollection
  }
}
