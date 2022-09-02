export interface CmdInvokerExecOptions {
  cwd: string
  command: string
}

export type CmdInvokerExecTestsOptions = Omit<CmdInvokerExecOptions, 'command'> & {
  files?: string[]
  tests?: string[]
  watch?: boolean
}
