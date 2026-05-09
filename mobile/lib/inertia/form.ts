/**
 * @inertiajs/react-native — useForm hook
 *
 * API is identical to the web adapter's useForm.
 * Manages form data, submission, validation errors, and processing state.
 */

import { useState, useCallback, useRef } from "react"

import { router } from "./router"
import type { Errors, Method, VisitOptions } from "./types"

export interface InertiaFormProps<TForm extends Record<string, unknown>> {
  data: TForm
  setData: SetDataFn<TForm>
  errors: Partial<Record<keyof TForm, string>>
  hasErrors: boolean
  processing: boolean
  wasSuccessful: boolean
  recentlySuccessful: boolean
  isDirty: boolean
  transform: (callback: (data: TForm) => TForm) => void
  setDefaults: (field?: keyof TForm, value?: unknown) => void
  reset: (...fields: (keyof TForm)[]) => void
  setError: (field: keyof TForm, value: string) => void
  clearErrors: (...fields: (keyof TForm)[]) => void
  submit: (method: Method | Lowercase<Method>, url: string, options?: Omit<VisitOptions, "method" | "data">) => void
  get: (url: string, options?: Omit<VisitOptions, "method" | "data">) => void
  post: (url: string, options?: Omit<VisitOptions, "method" | "data">) => void
  put: (url: string, options?: Omit<VisitOptions, "method" | "data">) => void
  patch: (url: string, options?: Omit<VisitOptions, "method" | "data">) => void
  delete: (url: string, options?: Omit<VisitOptions, "method" | "data">) => void
  cancel: () => void
}

type SetDataFn<TForm> = {
  (key: keyof TForm, value: TForm[keyof TForm]): void
  (values: Partial<TForm>): void
  (callback: (prev: TForm) => TForm): void
}

export function useForm<TForm extends Record<string, unknown>>(
  initialData: TForm,
): InertiaFormProps<TForm> {
  const [data, setDataState] = useState<TForm>(initialData)
  const [errors, setErrors] = useState<Partial<Record<keyof TForm, string>>>({})
  const [processing, setProcessing] = useState(false)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [recentlySuccessful, setRecentlySuccessful] = useState(false)

  const defaults = useRef<TForm>(initialData)
  const transformFn = useRef<((data: TForm) => TForm) | null>(null)
  const recentlySuccessfulTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const isDirty = JSON.stringify(data) !== JSON.stringify(defaults.current)

  const setData: SetDataFn<TForm> = useCallback(
    (...args: any[]) => {
      if (typeof args[0] === "function") {
        setDataState(args[0])
      } else if (typeof args[0] === "string") {
        setDataState((prev) => ({ ...prev, [args[0]]: args[1] }))
      } else {
        setDataState((prev) => ({ ...prev, ...args[0] }))
      }
    },
    [],
  )

  const submit = useCallback(
    (
      method: Method | Lowercase<Method>,
      url: string,
      options?: Omit<VisitOptions, "method" | "data">,
    ) => {
      const transformedData = transformFn.current
        ? transformFn.current(data)
        : data

      setProcessing(true)
      setWasSuccessful(false)
      setRecentlySuccessful(false)
      clearTimeout(recentlySuccessfulTimer.current)

      const flattenErrors = (raw: Errors): Partial<Record<keyof TForm, string>> => {
        const flat: Partial<Record<keyof TForm, string>> = {}
        for (const [key, value] of Object.entries(raw)) {
          flat[key as keyof TForm] = Array.isArray(value)
            ? value[0]
            : (value as string)
        }
        return flat
      }

      router.visit(url, {
        ...options,
        method: method.toUpperCase() as Method,
        data: transformedData as Record<string, unknown>,
        onSuccess: (page) => {
          setProcessing(false)

          // Inertia Rails redirects validation failures with
          // `inertia: {errors: ...}`, which lands as `page.props.errors` on
          // the redirected page (not as a 422). Treat that as a form error.
          const pageErrors = page.props.errors as Errors | undefined
          if (pageErrors && Object.keys(pageErrors).length > 0) {
            setErrors(flattenErrors(pageErrors))
            options?.onError?.(pageErrors)
            return
          }

          setWasSuccessful(true)
          setRecentlySuccessful(true)
          setErrors({})

          recentlySuccessfulTimer.current = setTimeout(() => {
            setRecentlySuccessful(false)
          }, 2000)

          options?.onSuccess?.(page)
        },
        onError: (responseErrors) => {
          setProcessing(false)
          setErrors(flattenErrors(responseErrors))
          options?.onError?.(responseErrors)
        },
        onFinish: () => {
          setProcessing(false)
          options?.onFinish?.()
        },
      })
    },
    [data],
  )

  return {
    data,
    setData,
    errors,
    hasErrors: Object.keys(errors).length > 0,
    processing,
    wasSuccessful,
    recentlySuccessful,
    isDirty,
    transform: (callback) => {
      transformFn.current = callback
    },
    setDefaults: (field?, value?) => {
      if (field === undefined) {
        defaults.current = { ...data }
      } else {
        defaults.current = { ...defaults.current, [field]: value }
      }
    },
    reset: (...fields) => {
      if (fields.length === 0) {
        setDataState(defaults.current)
      } else {
        setDataState((prev) => {
          const next = { ...prev }
          for (const field of fields) {
            next[field] = defaults.current[field]
          }
          return next
        })
      }
      setErrors({})
    },
    setError: (field, value) => {
      setErrors((prev) => ({ ...prev, [field]: value }))
    },
    clearErrors: (...fields) => {
      if (fields.length === 0) {
        setErrors({})
      } else {
        setErrors((prev) => {
          const next = { ...prev }
          for (const field of fields) {
            delete next[field]
          }
          return next
        })
      }
    },
    submit,
    get: (url, options) => submit("GET", url, options),
    post: (url, options) => submit("POST", url, options),
    put: (url, options) => submit("PUT", url, options),
    patch: (url, options) => submit("PATCH", url, options),
    delete: (url, options) => submit("DELETE", url, options),
    cancel: () => {
      // The router handles abort internally
    },
  }
}
