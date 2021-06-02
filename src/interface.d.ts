import TextCollection from './plugins/textCollection'

export type Page
  = 'basicModel'
  | 'batchTable'
  | 'atdTable'
  | 'dtaTable'
  | 'stopTable'
  | 'securityTable'
  | 'settings'
  | 'about'
  | 'invalid'

export type Table
  = 'batchTable'
  | 'atdTable'
  | 'dtaTable'
  | 'stopTable'
  | 'securityTable'
  | 'invalid'

export type TableSource
  = 'batch'
  | 'path_1'
  | 'path_2'
  | 'stop_point'
  | 'security_point'
  | 'invalid'

export type TableInputType = 'input' | 'select'
export type TableValueType = 'string' | 'number'

export type DataTableItem
  = BatchItem
  | AtdPathItem
  | DtaPathItem
  | StopPointItem
  | SecurityPointItem

export type DataTableItems
  = BatchItem[]
  | AtdPathItem[]
  | DtaPathItem[]
  | StopPointItem[]
  | SecurityPointItem[]

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
  sourceName: TableSource,
  invalidInfo?: string
  converter?: (item: DataTableItem) => DataTableItem
  invertConverter?: (item: DataTableItem) => DataTableItem
  validate?: (item: DataTableItem) => boolean
}

export interface DataTableBackup {
  identifier: string
  data: DataTableItems
}

export interface BasicModel {
  selected_batches: string
  initial_speed: string
  preferred_speed: string
  record_point_interval: number
  write_csv_interval: number
  number_of_people: number
}

export interface BatchItem {
  batchno: number
  arrivaltime: number
  arrivalnum: number
  dropoff_no: string
  stand_no: string
  security_no: string
  sc_capacity: number
}

export interface AtdPathItem {
  dropoff_no: string
  name: string
  security_no: string
  path: string
}

export interface DtaPathItem {
  name: string
  content: string
  security_no: string
  stand_no: string
  path: string
}

export interface StopPointItem {
  area: string
  name: string
  p_minvalue: number
  p_maxvalue: number
  dropoff_way: number
  delta: number
}

export interface SecurityPointItem {
  area: string
  name: string
  p_minvalue: number
  p_maxvalue: number
}

declare module 'vue/types/vue' {
  interface Vue {
    $texts: typeof TextCollection
  }
}
