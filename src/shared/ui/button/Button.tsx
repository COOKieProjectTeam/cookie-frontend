'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const sizeStyles = {
  sm: css`
    height: 32px;
    padding: 0 ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.type.small.size};
    line-height: ${({ theme }) => theme.typography.type.small.line};
  `,
  md: css`
    height: 40px;
    padding: 0 ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.type.body.size};
    line-height: ${({ theme }) => theme.typography.type.body.line};
  `,
  lg: css`
    height: 48px;
    padding: 0 ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.type.bodyLg.size};
    line-height: ${({ theme }) => theme.typography.type.bodyLg.line};
  `,
}

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary[500]};
    color: ${({ theme }) => theme.colors.text.inverse};
    border: 1px solid ${({ theme }) => theme.colors.primary[500]};
    box-shadow: ${({ theme }) => theme.shadows.elevation1};

    &:hover:not([data-loading='true']):not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary[600]};
      border-color: ${({ theme }) => theme.colors.primary[600]};
    }
    &:active:not([data-loading='true']):not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary[700]};
      border-color: ${({ theme }) => theme.colors.primary[700]};
      transform: translateY(1px);
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.bg.card};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.default};

    &:hover:not([data-loading='true']):not(:disabled) {
      background-color: ${({ theme }) => theme.colors.neutral[100]};
      border-color: ${({ theme }) => theme.colors.border.strong};
    }
    &:active:not([data-loading='true']):not(:disabled) {
      background-color: ${({ theme }) => theme.colors.neutral[200]};
      transform: translateY(1px);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid transparent;

    &:hover:not([data-loading='true']):not(:disabled) {
      background-color: ${({ theme }) => theme.colors.neutral[100]};
    }
    &:active:not([data-loading='true']):not(:disabled) {
      background-color: ${({ theme }) => theme.colors.neutral[200]};
    }
  `,
}

const StyledButton = styled.button<{
  $variant: ButtonVariant
  $size: ButtonSize
  $fullWidth: boolean
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition-property: background-color, border-color, color, transform, box-shadow;
  transition-duration: ${({ theme }) => theme.motion.duration.fast};
  transition-timing-function: ${({ theme }) => theme.motion.easing.inOut};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  &:disabled:not([data-loading='true']) {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &[data-loading='true'] {
    cursor: wait;
  }
`

const Label = styled.span<{ $hidden: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
`

const Spinner = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1em;
  height: 1em;
  margin: -0.5em 0 0 -0.5em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    startIcon,
    endIcon,
    children,
    type = 'button',
    disabled,
    onClick,
    ...rest
  },
  ref
) {
  return (
    <StyledButton
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? 'true' : undefined}
      onClick={loading ? undefined : onClick}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...rest}
    >
      <Label $hidden={loading}>
        {startIcon}
        {children}
        {endIcon}
      </Label>
      {loading && <Spinner aria-hidden="true" />}
    </StyledButton>
  )
})
