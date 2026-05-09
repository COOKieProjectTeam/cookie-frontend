'use client'

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styled, { css } from 'styled-components'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputStatus = 'default' | 'error' | 'success'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  status?: InputStatus
  size?: InputSize
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  fullWidth?: boolean
}

const fieldHeights: Record<InputSize, string> = { sm: '32px', md: '40px', lg: '48px' }

const inputSizeStyles: Record<InputSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 0 ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.type.small.size};
    line-height: ${({ theme }) => theme.typography.type.small.line};
  `,
  md: css`
    padding: 0 ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.type.body.size};
    line-height: ${({ theme }) => theme.typography.type.body.line};
  `,
  lg: css`
    padding: 0 ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.type.bodyLg.size};
    line-height: ${({ theme }) => theme.typography.type.bodyLg.line};
  `,
}

const affixPaddingStyles: Record<InputSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 0 ${({ theme }) => theme.spacing[3]};
  `,
  md: css`
    padding: 0 ${({ theme }) => theme.spacing[3]};
  `,
  lg: css`
    padding: 0 ${({ theme }) => theme.spacing[4]};
  `,
}

const Wrapper = styled.div<{ $fullWidth: boolean }>`
  display: inline-flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`

const InputLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.type.small.size};
  font-weight: 500;
  line-height: ${({ theme }) => theme.typography.type.small.line};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Field = styled.div<{ $size: InputSize; $disabled: boolean }>`
  --input-border: ${({ theme }) => theme.colors.border.default};
  --input-ring: transparent;

  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  height: ${({ $size }) => fieldHeights[$size]};
  border: 1px solid var(--input-border);
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.bg.card};
  box-shadow: 0 0 0 3px var(--input-ring);
  overflow: hidden;
  transition-property: border-color, box-shadow;
  transition-duration: ${({ theme }) => theme.motion.duration.fast};
  transition-timing-function: ${({ theme }) => theme.motion.easing.inOut};

  &:focus-within {
    --input-border: ${({ theme }) => theme.colors.border.focus};
    --input-ring: ${({ theme }) => theme.colors.primary[100]};
  }

  &[data-status='error'] {
    --input-border: ${({ theme }) => theme.colors.error.border};
  }
  &[data-status='error']:focus-within {
    --input-ring: ${({ theme }) => theme.colors.error[50]};
  }

  &[data-status='success'] {
    --input-border: ${({ theme }) => theme.colors.success.border};
  }
  &[data-status='success']:focus-within {
    --input-ring: ${({ theme }) => theme.colors.success[50]};
  }

  ${({ $disabled }) =>
    $disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    `}
`

const StyledInput = styled.input<{
  $size: InputSize
  $hasStart: boolean
  $hasEnd: boolean
}>`
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:disabled {
    cursor: not-allowed;
  }

  ${({ $size }) => inputSizeStyles[$size]}

  ${({ $hasStart, theme }) =>
    $hasStart &&
    css`
      padding-left: ${theme.spacing[2]};
    `}

  ${({ $hasEnd, theme }) =>
    $hasEnd &&
    css`
      padding-right: ${theme.spacing[2]};
    `}
`

const Affix = styled.span<{ $size: InputSize }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.muted};
  ${({ $size }) => affixPaddingStyles[$size]}
`

const HelperText = styled.p`
  font-size: ${({ theme }) => theme.typography.type.caption.size};
  line-height: ${({ theme }) => theme.typography.type.caption.line};
  color: ${({ theme }) => theme.colors.text.muted};

  &[data-status='error'] {
    color: ${({ theme }) => theme.colors.error.fg};
  }

  &[data-status='success'] {
    color: ${({ theme }) => theme.colors.success.fg};
  }
`

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    status = 'default',
    size = 'md',
    startAdornment,
    endAdornment,
    fullWidth = false,
    disabled,
    id: idProp,
    ...rest
  },
  ref
) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hasHelper = Boolean(helperText)
  const dataStatus = status !== 'default' ? status : undefined

  return (
    <Wrapper $fullWidth={fullWidth}>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <Field $size={size} $disabled={!!disabled} data-status={dataStatus}>
        {startAdornment && <Affix $size={size}>{startAdornment}</Affix>}
        <StyledInput
          ref={ref}
          id={id}
          disabled={disabled}
          $size={size}
          $hasStart={Boolean(startAdornment)}
          $hasEnd={Boolean(endAdornment)}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={hasHelper ? `${id}-helper` : undefined}
          {...rest}
        />
        {endAdornment && <Affix $size={size}>{endAdornment}</Affix>}
      </Field>
      {hasHelper && (
        <HelperText id={`${id}-helper`} data-status={dataStatus}>
          {helperText}
        </HelperText>
      )}
    </Wrapper>
  )
})
