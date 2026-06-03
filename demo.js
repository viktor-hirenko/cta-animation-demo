const SHIMMER_VARIANT = 'shimmer'
const SHIMMER_BORDER_VARIANT = 'shimmer-border-trace'
const POP_SHIMMER_VARIANT = 'pop-shimmer'
const ARROW_HOVER_VARIANT = 'arrow-hover'
const ARROW_HOVER_PRESENT_VARIANT = 'arrow-hover-present'
const ICON_BOUNCE_VARIANT = 'icon-bounce'
const TEXT_BOUNCE_VARIANT = 'text-bounce'
const HOVER_GLOW_INFINITE_VARIANT = 'hover-glow-infinite'
const BORDER_GLOW_INFINITE_VARIANT = 'border-glow-infinite'
const GIFT_ICON_SRC = './assets/image-gift.png'
const PRESENT_ICON_SRC = './assets/present.svg'
const ARROW_HOVER_ICON_HTML =
  '<svg class="cta-arrow-hover__icon" width="15" height="14" viewBox="0 0 15 14" fill="none" aria-hidden="true"><path d="M1.5 7h9.5M8.5 4.5 12 7l-3.5 2.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const HOVER_GLOW_VARIANT = 'hover-glow'
const DEMO_PREVIEW_PLAY_LABEL = 'Відтворити'
const READY_DELAY_MS = 700
const SHIMMER_DURATION_MS = 3000
const SHIMMER_REPEAT_DELAY_MS = 6000
const MOBILE_LOOP_REPEAT_DELAY_MS = 7000
const HOVER_GLOW_PASS_MS = 7000
const HOVER_GLOW_RESTART_GAP_MS = 400
const DESKTOP_MAX_READY_PASSES = 2
const POP_SHIMMER_READY_DELAY_MS = 600
const POP_SHIMMER_SCALE_DURATION_MS = 1700
const POP_SHIMMER_REPEAT_DELAY_MS = 6000
const MAX_POP_SHIMMER_PASSES = 2
const BORDER_TRACE_DELAY_MS = 9000
const BORDER_TRACE_DURATION_MS = 3000
const MAX_SHIMMER_PASSES = 2
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const ANIMATION_CLASS_PREFIX = 'cta-animation--'

const ANIMATION_VARIANTS = [
  'shimmer',
  'pop-shimmer',
  'shimmer-border-trace',
  'glow',
  'icon-nudge',
  'ready-highlight',
  'arrow-hover',
  'arrow-hover-present',
  'hover-glow',
  ICON_BOUNCE_VARIANT,
  TEXT_BOUNCE_VARIANT,
  HOVER_GLOW_INFINITE_VARIANT,
  BORDER_GLOW_INFINITE_VARIANT,
]

const HOVER_ONLY_VARIANTS = new Set([ARROW_HOVER_VARIANT, ARROW_HOVER_PRESENT_VARIANT])

const READY_HIGHLIGHT_VARIANT = 'ready-highlight'
const UI_HIDDEN_VARIANTS = new Set([SHIMMER_BORDER_VARIANT, READY_HIGHLIGHT_VARIANT])

function isVariantHiddenInUi(variantId) {
  return UI_HIDDEN_VARIANTS.has(variantId)
}

const CSS_ONLY_HOVER_VARIANTS = new Set([
  ARROW_HOVER_VARIANT,
  ARROW_HOVER_PRESENT_VARIANT,
  HOVER_GLOW_VARIANT,
])

const ATTENTION_SEQUENCE_VARIANTS = new Set([SHIMMER_VARIANT, SHIMMER_BORDER_VARIANT])
const POP_SHIMMER_SEQUENCE_VARIANTS = new Set([POP_SHIMMER_VARIANT])

const VARIANT_ANIMATION_MS = {
  shimmer: SHIMMER_DURATION_MS,
  'pop-shimmer': POP_SHIMMER_SCALE_DURATION_MS,
  'shimmer-border-trace': BORDER_TRACE_DURATION_MS,
  glow: 2200,
  'icon-nudge': 650,
  'ready-highlight': 780,
  'arrow-hover': 640,
  'arrow-hover-present': 720,
  'hover-glow': 6000,
  [ICON_BOUNCE_VARIANT]: 900,
  [TEXT_BOUNCE_VARIANT]: 950,
  [HOVER_GLOW_INFINITE_VARIANT]: HOVER_GLOW_PASS_MS,
  [BORDER_GLOW_INFINITE_VARIANT]: BORDER_TRACE_DURATION_MS,
}

const demoRoot = document.getElementById('cta-animation-demo')
const form = document.getElementById('mock-registration')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const termsInput = document.getElementById('terms')
const statusEl = document.getElementById('demo-status')

function setDemoStatusText(text) {
  if (statusEl) {
    statusEl.textContent = text
  }
}

function setDemoStatusState(state) {
  if (statusEl) {
    statusEl.dataset.state = state
  }
}
const toggleButtons = document.querySelectorAll('[data-toggle]')
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

const presetButtons = document.querySelectorAll('[data-preset]')
const labelButtons = document.querySelectorAll('[data-label]')
const variantButtons = document.querySelectorAll('[data-variant-button]')
const formCta = document.getElementById('form-cta')
const simulateCtaDisabledInput = document.getElementById('simulate-cta-disabled')
const mobileScreenshotCta = document.getElementById('mobile-screenshot-cta')
const modeTabButtons = document.querySelectorAll('.demo-mode-tab[data-demo-mode]')
const animationPicker = document.getElementById('animation-picker')
const replayPresentationButton = document.getElementById('replay-presentation')
const variantCatalog = document.getElementById('variant-catalog')
const variantDetailMount = document.getElementById('variant-detail-mount')
const variantDetailIntro = document.querySelector('.variant-detail__intro')
const replayPresentationHint = document.querySelector(
  '.demo-controls__hint--after-action'
)

let selectedVariant = 'shimmer'
let wasReady = false
let readyAnimationTimeoutId = null
let shimmerRepeatTimeoutId = null
let popShimmerRepeatTimeoutId = null
let borderTraceTimeoutId = null
let shimmerSequenceActive = false
let popShimmerSequenceActive = false
let shimmerPassCount = 0
let popShimmerPassCount = 0
let pendingShimmerEnds = 0
let pendingPopShimmerEnds = 0
let pendingBorderTraceEnds = 0
let genericReadySequenceActive = false
let genericReadyPassCount = 0
let genericReadyTimeoutId = null
let genericReadyRepeatTimeoutId = null
let mobileLoopTimeoutId = null

function getHoverOnlyEmptyHint() {
  if (selectedVariant === ARROW_HOVER_PRESENT_VARIANT) {
    return 'Цей варіант лише при наведенні — «Заповнити форму» не потрібно. Наведіть курсор на кнопку Sign up у формі праворуч.'
  }

  return 'Цей варіант лише при наведенні — «Заповнити форму» не запускає анімацію. Наведіть курсор на кнопку Sign up у формі праворуч.'
}

function isSimulateCtaDisabledEnabled() {
  return simulateCtaDisabledInput instanceof HTMLInputElement && simulateCtaDisabledInput.checked
}

function shouldShowFormCtaAsDisabled() {
  return (
    isPresentationMode() &&
    isSimulateCtaDisabledEnabled() &&
    !isFormReady() &&
    !usesHoverOnlyVariant()
  )
}

function syncCtaDisabledVisual() {
  if (!(formCta instanceof HTMLButtonElement)) {
    return
  }

  const inactive = shouldShowFormCtaAsDisabled()
  formCta.disabled = inactive
  formCta.setAttribute('aria-disabled', String(inactive))
  formCta.classList.toggle('cta-demo--form-inactive', inactive)
  demoRoot.dataset.ctaInactiveDemo = inactive ? 'true' : 'false'
}

function getEmptyFormStatus() {
  if (usesHoverOnlyVariant()) {
    return getHoverOnlyEmptyHint()
  }

  if (isSimulateCtaDisabledEnabled()) {
    return 'Sign up виглядає неактивною. Натисніть «Заповнити форму» — кнопка стане активною і з’явиться анімація.'
  }

  return 'Натисніть «Заповнити форму» — побачите анімацію на кнопці Sign up у формі праворуч.'
}

function getMobilePickerStatus() {
  return 'Оберіть варіант нижче — анімація на кнопці Sign up, повтор приблизно кожні 7 с.'
}

function getReadyStatusMessage() {
  if (usesHoverOnlyVariant()) {
    return getHoverOnlyEmptyHint()
  }

  if (isMobileScreenshotMode()) {
    return 'Цикл анімації на кнопці Sign up. «Відтворити» — ще один прохід.'
  }

  return 'Форма заповнена — дивіться анімацію на кнопці Sign up у формі праворуч. Можна «Відтворити» зліва.'
}

function isEmailValid() {
  return EMAIL_PATTERN.test(emailInput.value.trim())
}

function isPasswordValid() {
  return passwordInput.value.length >= MIN_PASSWORD_LENGTH
}

function isFormReady() {
  return isEmailValid() && isPasswordValid() && termsInput.checked
}

/** Десктоп — лише при валідній формі; мобільний бар — без перевірки форми. */
function canRunPresentationPlayback() {
  if (isPlaybackBlocked()) {
    return false
  }

  if (isMobileScreenshotMode()) {
    return true
  }

  return isFormReady()
}

function isPresentationMode() {
  return demoRoot.dataset.demoMode === 'presentation'
}

function isMobileScreenshotMode() {
  return demoRoot.dataset.demoMode === 'mobile-screenshot'
}

function getPrimaryCta() {
  if (isMobileScreenshotMode() && mobileScreenshotCta) {
    return mobileScreenshotCta
  }

  return formCta
}

function usesShimmerSequence() {
  return ATTENTION_SEQUENCE_VARIANTS.has(selectedVariant)
}

function usesBorderTraceSequence() {
  return selectedVariant === SHIMMER_BORDER_VARIANT
}

function usesPopShimmerSequence() {
  return selectedVariant === POP_SHIMMER_VARIANT
}

function usesHoverOnlyVariant() {
  return HOVER_ONLY_VARIANTS.has(selectedVariant)
}

function isHoverOnlyVariant(variantId) {
  return HOVER_ONLY_VARIANTS.has(variantId)
}

function syncPresentationReplayUi() {
  const hideReplayForHoverDesktop =
    usesHoverOnlyVariant() && !isMobileScreenshotMode()

  if (replayPresentationButton) {
    replayPresentationButton.hidden = hideReplayForHoverDesktop
    replayPresentationButton.textContent = DEMO_PREVIEW_PLAY_LABEL
  }

  if (replayPresentationHint) {
    replayPresentationHint.hidden = hideReplayForHoverDesktop

    if (hideReplayForHoverDesktop) {
      return
    }

    if (isMobileScreenshotMode()) {
      replayPresentationHint.textContent =
        'Ще один прохід на Sign up у нижньому барі телефону праворуч.'
    } else {
      replayPresentationHint.textContent =
        '«Відтворити» зліва — на Sign up у формі; прев’ю варіанту — тільки в акордеоні нижче.'
    }
  }
}

function updateVariantDetailIntro(variantId) {
  if (!variantDetailIntro) {
    return
  }

  if (isHoverOnlyVariant(variantId)) {
    variantDetailIntro.innerHTML =
      'Лише текст опису. Подивитися ефект — наведіть курсор на кнопку Sign up у відповідній картці в акордеоні нижче.'
    return
  }

  if (isMobileScreenshotMode()) {
    variantDetailIntro.innerHTML =
      'Лише текст опису. Анімація на Sign up у телефоні праворуч; «Відтворити» в картці — в акордеоні нижче.'
    return
  }

  variantDetailIntro.innerHTML =
    'Лише текст опису. На формі — «Заповнити форму» і «Відтворити» зліва; прев’ю варіанту — в акордеоні «Усі варіанти» нижче.'
}

function resolvePreviewButtonForReplay(replayTrigger, variantId) {
  if (replayTrigger instanceof HTMLButtonElement) {
    if (replayTrigger.id === 'replay-presentation') {
      return getPrimaryCta()
    }

    const card = replayTrigger.closest('.variant-card')
    const inCard = card?.querySelector(`[data-variant-button="${variantId}"]`)

    if (inCard instanceof HTMLButtonElement) {
      return inCard
    }
  }

  return getPrimaryCta()
}

function replayArrowHoverPreview(button) {
  if (isPlaybackBlocked()) {
    return
  }

  const variantId = button.dataset.variantButton ?? ARROW_HOVER_VARIANT
  const durationMs = VARIANT_ANIMATION_MS[variantId] ?? 720

  button.classList.remove('is-hover-animate', 'is-ready-animate')
  reflow(button)
  button.classList.add('is-hover-animate')

  if (button._arrowHoverPreviewTimeoutId) {
    window.clearTimeout(button._arrowHoverPreviewTimeoutId)
  }

  button._arrowHoverPreviewTimeoutId = window.setTimeout(() => {
    button.classList.remove('is-hover-animate')
    button._arrowHoverPreviewTimeoutId = null
  }, durationMs)
}

function usesHoverGlowSequence() {
  return selectedVariant === HOVER_GLOW_VARIANT
}

function usesHoverGlowInfiniteSequence() {
  return selectedVariant === HOVER_GLOW_INFINITE_VARIANT
}

function usesBorderGlowInfiniteSequence() {
  return selectedVariant === BORDER_GLOW_INFINITE_VARIANT
}

function shouldBorderTraceRunInfinite(button = getPrimaryCta()) {
  if (selectedVariant === BORDER_GLOW_INFINITE_VARIANT) {
    return true
  }

  return (
    selectedVariant === SHIMMER_BORDER_VARIANT && button === getPrimaryCta()
  )
}

function usesGenericReadySequence() {
  return (
    !usesHoverOnlyVariant() &&
    !usesShimmerSequence() &&
    !usesPopShimmerSequence() &&
    !usesHoverGlowSequence() &&
    !usesHoverGlowInfiniteSequence() &&
    !usesBorderGlowInfiniteSequence()
  )
}

function getMaxShimmerPasses() {
  return isMobileScreenshotMode() ? 1 : MAX_SHIMMER_PASSES
}

function getMaxPopShimmerPasses() {
  return isMobileScreenshotMode() ? 1 : MAX_POP_SHIMMER_PASSES
}

function getMaxGenericReadyPasses() {
  if (!isMobileScreenshotMode()) {
    return DESKTOP_MAX_READY_PASSES
  }

  if (selectedVariant === TEXT_BOUNCE_VARIANT || selectedVariant === ICON_BOUNCE_VARIANT) {
    return DESKTOP_MAX_READY_PASSES
  }

  return 1
}

function usesCssReadyDelayOnReadyAnimate() {
  return usesGenericReadySequence()
}

function setJsScheduledReadyDelay(button) {
  button.dataset.ctaJsScheduled = 'true'
  button.style.setProperty('--cta-ready-delay', '0ms')
}

function clearJsScheduledReadyDelay(button) {
  delete button.dataset.ctaJsScheduled
  button.style.removeProperty('--cta-ready-delay')
}

function clearJsScheduledReadyDelayOnButtons() {
  getAnimatedButtons().forEach(clearJsScheduledReadyDelay)
}

function cancelMobileLoop() {
  if (mobileLoopTimeoutId !== null) {
    window.clearTimeout(mobileLoopTimeoutId)
    mobileLoopTimeoutId = null
  }
}

function scheduleMobilePresentationLoop(restartFn) {
  cancelMobileLoop()

  if (!isMobileScreenshotMode() || isPlaybackBlocked()) {
    return
  }

  mobileLoopTimeoutId = window.setTimeout(() => {
    mobileLoopTimeoutId = null

    if (!isMobileScreenshotMode() || isPlaybackBlocked()) {
      return
    }

    restartFn()
  }, MOBILE_LOOP_REPEAT_DELAY_MS)
}

const formPresetGroup = document.querySelector('.demo-controls__group--form-preset')
const presentationVariantHint = document.getElementById('demo-presentation-variant-hint')
const presentationStepLabel = document.getElementById('demo-presentation-step-label')
const demoHeaderSteps = document.getElementById('demo-header-steps')

function syncDemoControlsForMode() {
  const mobile = isMobileScreenshotMode()

  if (formPresetGroup) {
    formPresetGroup.hidden = mobile
  }

  if (presentationStepLabel) {
    presentationStepLabel.textContent = mobile ? '1. Варіант підсвітки' : '2. Варіант підсвітки'
  }

  if (presentationVariantHint) {
    if (usesHoverGlowInfiniteSequence()) {
      presentationVariantHint.innerHTML = mobile
        ? 'Те саме кольорове кільце, що «Світіння кольорової обводки», але без паузи й без циклу демо ~7&nbsp;с.'
        : 'Після «Заповнити форму» — те саме кольорове кільце на <strong>Sign up</strong>, без паузи й без повтору циклу.'
    } else if (usesBorderGlowInfiniteSequence()) {
      presentationVariantHint.innerHTML = mobile
        ? 'Безперервна біла обводка на <strong>Sign up</strong> у телефоні — без паузи й без циклу демо ~7&nbsp;с.'
        : 'Після «Заповнити форму» — безперервна біла обводка на <strong>Sign up</strong>, без паузи й без повтору циклу.'
    } else if (mobile) {
      presentationVariantHint.innerHTML =
        'Оберіть варіант — анімація одразу на кнопці <strong>Sign up</strong> праворуч; повтор циклу ~7&nbsp;с.'
    } else if (usesHoverOnlyVariant()) {
      presentationVariantHint.innerHTML =
        'Наведіть курсор на кнопку <strong>Sign up</strong> у формі праворуч (форма не потрібна). У акордеоні — та сама кнопка в картці.'
    } else {
      presentationVariantHint.innerHTML =
        'Після «Заповнити форму» — кнопка <strong>Sign up</strong> у формі праворуч: затримка, показ, другий показ через 6&nbsp;с.'
    }
  }

  if (demoHeaderSteps) {
    demoHeaderSteps.innerHTML = mobile
      ? '<strong>1.</strong> Оберіть варіант &nbsp;·&nbsp; <strong>2.</strong> Подивіться анімацію на <strong>Sign up</strong> у телефоні праворуч.'
      : '<strong>1.</strong> <strong>Заповнити форму</strong> &nbsp;·&nbsp; <strong>2.</strong> Обрати варіант &nbsp;·&nbsp; <strong>3.</strong> Подивитися анімацію на <strong>Sign up</strong> праворуч.'
  }

  syncHoverOnlyPickerVisibility()

  if (statusEl) {
    statusEl.hidden = mobile
    if (mobile) {
      setDemoStatusText('')
    }
  }

  syncCtaDisabledVisual()
}

function startMobilePresentationPlayback() {
  if (!isMobileScreenshotMode() || usesHoverOnlyVariant()) {
    return
  }

  if (isPlaybackBlocked()) {
    return
  }

  cancelPendingAnimations()
  wasReady = true
  triggerReadyAnimations()
}

function syncHoverOnlyPickerVisibility() {
  const mobile = isMobileScreenshotMode()
  const divider = document.getElementById('hover-only-picker-divider')

  if (divider) {
    divider.hidden = mobile
    divider.setAttribute('aria-hidden', String(mobile))
  }

  animationPicker
    ?.querySelectorAll('.demo-animation-option--hover-only')
    .forEach(label => {
      label.hidden = mobile
      label.setAttribute('aria-hidden', String(mobile))

      const input = label.querySelector('input[type="radio"]')
      if (input instanceof HTMLInputElement) {
        input.disabled = mobile
        if (mobile) {
          input.checked = false
        }
      }
    })

  if (mobile && usesHoverOnlyVariant()) {
    setSelectedVariant(SHIMMER_VARIANT)
  }
}

function isArrowHoverVariant(variantId) {
  return variantId === ARROW_HOVER_VARIANT || variantId === ARROW_HOVER_PRESENT_VARIANT
}

function createGiftImageIcon() {
  const icon = document.createElement('img')
  icon.className = 'ui-button__icon ui-image w-6 h-6'
  icon.src = GIFT_ICON_SRC
  icon.alt = 'image-gift'
  icon.width = 24
  icon.height = 24
  icon.loading = 'lazy'
  return icon
}

function createPresentSvgIcon() {
  const icon = document.createElement('object')
  icon.className = 'ui-button__icon ui-button__icon--present cta-present-icon'
  icon.type = 'image/svg+xml'
  icon.data = PRESENT_ICON_SRC
  icon.setAttribute('aria-hidden', 'true')
  return icon
}

function syncGiftIconOnButton(button, usePresent) {
  const presentIcon = button.querySelector('object.ui-button__icon--present')
  const imageIcon = button.querySelector('img.ui-button__icon')

  if (usePresent) {
    if (presentIcon) {
      return
    }

    imageIcon?.remove()
    button.appendChild(createPresentSvgIcon())
    return
  }

  presentIcon?.remove()

  if (!imageIcon) {
    button.appendChild(createGiftImageIcon())
  }
}

function syncArrowHoverIcon(arrow) {
  arrow.innerHTML = ARROW_HOVER_ICON_HTML
}

function appendArrowToLead(lead) {
  const arrow = document.createElement('span')
  arrow.className = 'cta-arrow-hover__arrow'
  arrow.setAttribute('aria-hidden', 'true')
  arrow.innerHTML = ARROW_HOVER_ICON_HTML
  lead.append(arrow)
}

function ensureArrowHoverMarkup(button) {
  const icon = button.querySelector('.ui-button__icon')
  const lead = button.querySelector('.cta-arrow-hover__lead')
  const label =
    lead?.querySelector('.ui-button__label') ??
    button.querySelector(':scope > .ui-button__label')

  if (!label || !icon) {
    return
  }

  if (lead) {
    const arrow = lead.querySelector('.cta-arrow-hover__arrow')
    if (arrow) {
      syncArrowHoverIcon(arrow)
    } else {
      appendArrowToLead(lead)
    }

    return
  }

  button.querySelector('.cta-arrow-hover__arrow')?.remove()

  const newLead = document.createElement('span')
  newLead.className = 'cta-arrow-hover__lead'
  label.replaceWith(newLead)
  newLead.append(label)
  appendArrowToLead(newLead)
}

function removeArrowHoverMarkup(button) {
  const lead = button.querySelector('.cta-arrow-hover__lead')
  const label = button.querySelector('.ui-button__label')
  const icon = button.querySelector('.ui-button__icon')

  if (lead && label && icon) {
    button.insertBefore(label, icon)
    lead.remove()
    return
  }

  button.querySelector('.cta-arrow-hover__arrow')?.remove()
}

function getPopShimmerSequenceTargets() {
  return [getPrimaryCta()]
}

function getAttentionSequenceTargets() {
  return [getPrimaryCta()]
}

function stripAnimationClasses(button) {
  ANIMATION_VARIANTS.forEach(variant => {
    button.classList.remove(`${ANIMATION_CLASS_PREFIX}${variant}`)
  })
  button.classList.remove(`${ANIMATION_CLASS_PREFIX}border-trace`)
  button.classList.remove(`${ANIMATION_CLASS_PREFIX}arrow-hover`)
  button.classList.remove('is-border-tracing')
}

function applyCtaAnimationClass(button, variantId) {
  stripAnimationClasses(button)
  removeArrowHoverMarkup(button)

  if (variantId === SHIMMER_BORDER_VARIANT) {
    button.classList.add(
      `${ANIMATION_CLASS_PREFIX}shimmer`,
      `${ANIMATION_CLASS_PREFIX}border-trace`
    )
    return
  }

  if (variantId === BORDER_GLOW_INFINITE_VARIANT) {
    button.classList.add(`${ANIMATION_CLASS_PREFIX}border-trace`)
    return
  }

  if (variantId === HOVER_GLOW_INFINITE_VARIANT) {
    button.classList.add(
      `${ANIMATION_CLASS_PREFIX}${HOVER_GLOW_VARIANT}`,
      `${ANIMATION_CLASS_PREFIX}${HOVER_GLOW_INFINITE_VARIANT}`
    )
    return
  }

  if (isArrowHoverVariant(variantId)) {
    button.classList.add(`${ANIMATION_CLASS_PREFIX}arrow-hover`)
    if (variantId === ARROW_HOVER_PRESENT_VARIANT) {
      button.classList.add(`${ANIMATION_CLASS_PREFIX}arrow-hover-present`)
    }
    syncGiftIconOnButton(button, variantId === ARROW_HOVER_PRESENT_VARIANT)
    ensureArrowHoverMarkup(button)
    return
  }

  button.classList.add(`${ANIMATION_CLASS_PREFIX}${variantId}`)
  syncGiftIconOnButton(button, false)
}

function applyPrimaryCtaAnimation(variantId) {
  applyCtaAnimationClass(getPrimaryCta(), variantId)
}

function getAnimatedButtons() {
  return [getPrimaryCta()]
}

function clearVariantAnimations() {
  getAnimatedButtons().forEach(button => {
    button.classList.remove(
      'is-ready-animate',
      'is-hover-animate',
      'is-shimmering',
      'is-border-tracing'
    )
    clearJsScheduledReadyDelay(button)
    if (button._instantAnimTimeoutId) {
      window.clearTimeout(button._instantAnimTimeoutId)
      button._instantAnimTimeoutId = null
    }
    if (button._borderTraceTimeoutId) {
      window.clearTimeout(button._borderTraceTimeoutId)
      button._borderTraceTimeoutId = null
    }
  })
}

function cancelShimmerSequence() {
  shimmerSequenceActive = false
  shimmerPassCount = 0
  pendingShimmerEnds = 0
  pendingBorderTraceEnds = 0

  if (readyAnimationTimeoutId !== null) {
    window.clearTimeout(readyAnimationTimeoutId)
    readyAnimationTimeoutId = null
  }

  if (shimmerRepeatTimeoutId !== null) {
    window.clearTimeout(shimmerRepeatTimeoutId)
    shimmerRepeatTimeoutId = null
  }

  if (borderTraceTimeoutId !== null) {
    window.clearTimeout(borderTraceTimeoutId)
    borderTraceTimeoutId = null
  }

  getAttentionSequenceTargets().forEach(button => {
    button.classList.remove(
      'is-shimmering',
      'is-border-tracing',
      'is-ready-animate',
      'is-hover-animate'
    )

    if (button._borderTraceTimeoutId) {
      window.clearTimeout(button._borderTraceTimeoutId)
      button._borderTraceTimeoutId = null
    }
  })
}

function cancelGenericReadySequence() {
  genericReadySequenceActive = false
  genericReadyPassCount = 0

  if (genericReadyTimeoutId !== null) {
    window.clearTimeout(genericReadyTimeoutId)
    genericReadyTimeoutId = null
  }

  if (genericReadyRepeatTimeoutId !== null) {
    window.clearTimeout(genericReadyRepeatTimeoutId)
    genericReadyRepeatTimeoutId = null
  }
}

function cancelPopShimmerSequence() {
  popShimmerSequenceActive = false
  popShimmerPassCount = 0
  pendingPopShimmerEnds = 0

  if (readyAnimationTimeoutId !== null) {
    window.clearTimeout(readyAnimationTimeoutId)
    readyAnimationTimeoutId = null
  }

  if (popShimmerRepeatTimeoutId !== null) {
    window.clearTimeout(popShimmerRepeatTimeoutId)
    popShimmerRepeatTimeoutId = null
  }

  getPopShimmerSequenceTargets().forEach(button => {
    button.classList.remove('is-shimmering', 'is-ready-animate', 'is-hover-animate')
  })
}

function playShimmerPass(button) {
  button.classList.remove('is-shimmering', 'is-ready-animate', 'is-hover-animate')
  reflow(button)
  button.classList.add('is-shimmering')
}

function playShimmerPassAll() {
  if (!canRunPresentationPlayback() || !shimmerSequenceActive) {
    return
  }

  const targets = getAttentionSequenceTargets()
  pendingShimmerEnds = targets.length
  targets.forEach(target => {
    playShimmerPass(target)
  })
}

function playPopShimmerPass(button, includeScale) {
  button.classList.remove('is-shimmering', 'is-ready-animate', 'is-hover-animate')
  reflow(button)

  if (includeScale) {
    button.classList.add('is-ready-animate')
    return
  }

  button.classList.add('is-shimmering')
}

function playPopShimmerPassAll(includeScale = true) {
  if (!canRunPresentationPlayback() || !popShimmerSequenceActive) {
    return
  }

  const targets = getPopShimmerSequenceTargets()
  pendingPopShimmerEnds = targets.length
  targets.forEach(target => {
    playPopShimmerPass(target, includeScale)
  })
}

function completePopShimmerSequence() {
  popShimmerSequenceActive = false
  popShimmerPassCount = 0
  pendingPopShimmerEnds = 0

  getPopShimmerSequenceTargets().forEach(button => {
    button.classList.remove('is-shimmering', 'is-ready-animate')
  })

  if (!canRunPresentationPlayback() || !usesPopShimmerSequence()) {
    return
  }

  if (isMobileScreenshotMode()) {
    setDemoStatusText(
      'Наступний показ через кілька секунд.'
    )
    scheduleMobilePresentationLoop(startPopShimmerSequence)
    return
  }

  setDemoStatusText('Анімація завершена. Можна натиснути Sign up або «Переграти ще раз».')
}

function finishPopShimmerPass(button) {
  if (!popShimmerSequenceActive) {
    return
  }

  pendingPopShimmerEnds = Math.max(0, pendingPopShimmerEnds - 1)

  if (pendingPopShimmerEnds > 0) {
    return
  }

  popShimmerPassCount += 1

  if (popShimmerPassCount >= getMaxPopShimmerPasses()) {
    completePopShimmerSequence()
    return
  }

  if (canRunPresentationPlayback() && !isMobileScreenshotMode()) {
    setDemoStatusText(
      'Перший показ завершено — через кілька секунд буде повтор (якщо не натиснули Sign up).'
    )
  }

  popShimmerRepeatTimeoutId = window.setTimeout(() => {
    popShimmerRepeatTimeoutId = null

    if (!canRunPresentationPlayback() || !popShimmerSequenceActive) {
      return
    }

    playPopShimmerPassAll(true)
  }, POP_SHIMMER_REPEAT_DELAY_MS)
}

function handlePopShimmerAnimationEnd(button, event) {
  if (event.animationName === 'cta-pop-shimmer-scale') {
    if (!button.classList.contains('is-ready-animate')) {
      return
    }

    finishPopShimmerPass(button)
    return
  }

  if (event.animationName !== 'cta-shimmer-sweep') {
    return
  }

  if (button.classList.contains('is-ready-animate')) {
    button.classList.remove('is-ready-animate')
    return
  }

  if (!button.classList.contains('is-shimmering')) {
    return
  }

  button.classList.remove('is-shimmering')
  finishPopShimmerPass(button)
}

function startPopShimmerSequence() {
  cancelPopShimmerSequence()
  popShimmerSequenceActive = true
  popShimmerPassCount = 0

  if (isPlaybackBlocked()) {
    popShimmerSequenceActive = false
    return
  }

  readyAnimationTimeoutId = window.setTimeout(() => {
    readyAnimationTimeoutId = null
    playPopShimmerPassAll(true)
  }, POP_SHIMMER_READY_DELAY_MS)
}

function replayPopShimmer(button) {
  if (isPlaybackBlocked()) {
    if (demoRoot.dataset.freezeAnimations === 'true') {
      showReplayBlockedMessage('freeze')
    } else {
      showReplayBlockedMessage('reduced')
    }
    return
  }

  button.classList.remove('is-shimmering', 'is-ready-animate', 'is-hover-animate')
  reflow(button)
  playPopShimmerPass(button, true)
}

function getBorderTraceTargets() {
  return getAttentionSequenceTargets().filter(button =>
    button.classList.contains(`${ANIMATION_CLASS_PREFIX}border-trace`)
  )
}

function playBorderTrace(button) {
  if (button === getPrimaryCta() && selectedVariant === SHIMMER_BORDER_VARIANT) {
    applyPrimaryCtaAnimation(SHIMMER_BORDER_VARIANT)
  }

  if (!button.classList.contains(`${ANIMATION_CLASS_PREFIX}border-trace`)) {
    return
  }

  button.classList.remove('is-border-tracing')
  reflow(button)
  button.classList.add('is-border-tracing')

  if (button._borderTraceTimeoutId) {
    window.clearTimeout(button._borderTraceTimeoutId)
    button._borderTraceTimeoutId = null
  }

  if (!shouldBorderTraceRunInfinite(button)) {
    button._borderTraceTimeoutId = window.setTimeout(() => {
      button._borderTraceTimeoutId = null
      handleBorderTraceAnimationEnd(button)
    }, BORDER_TRACE_DURATION_MS + 100)
  }
}

function playBorderTraceAll() {
  if (isPlaybackBlocked()) {
    return
  }

  const targets = getBorderTraceTargets()
  if (targets.length === 0) {
    return
  }

  pendingBorderTraceEnds = targets.length

  if (canRunPresentationPlayback() && !isMobileScreenshotMode()) {
    setDemoStatusText('Додаткове світіння обводки на кнопці.')
  }

  targets.forEach(target => {
    playBorderTrace(target)
  })
}

function completeAttentionSequence() {
  shimmerSequenceActive = false
  shimmerPassCount = 0
  pendingShimmerEnds = 0
  pendingBorderTraceEnds = 0

  getAttentionSequenceTargets().forEach(button => {
    button.classList.remove('is-shimmering', 'is-border-tracing')
  })

  if (!canRunPresentationPlayback() || !usesShimmerSequence()) {
    return
  }

  if (isMobileScreenshotMode()) {
    setDemoStatusText('Наступний показ — через ~7 с.')
    scheduleMobilePresentationLoop(startShimmerSequence)
    return
  }

  setDemoStatusText(
    usesBorderTraceSequence()
      ? 'Анімація завершена (шимер і обвід). Кнопка готова до натискання.'
      : 'Анімація завершена. Кнопка готова до натискання.'
  )
}

function scheduleBorderTraceAfterShimmer() {
  if (isMobileScreenshotMode()) {
    completeAttentionSequence()
    return
  }
  getAttentionSequenceTargets().forEach(button => {
    button.classList.remove('is-shimmering')
  })
  pendingShimmerEnds = 0

  if (canRunPresentationPlayback() && !isMobileScreenshotMode()) {
    setDemoStatusText('Скоро додаткове світіння обводки — якщо Sign up ще не натиснули.')
  }

  borderTraceTimeoutId = window.setTimeout(() => {
    borderTraceTimeoutId = null

    if (!canRunPresentationPlayback() || !shimmerSequenceActive) {
      return
    }

    playBorderTraceAll()
  }, BORDER_TRACE_DELAY_MS)
}

function handleShimmerAnimationEnd(button) {
  if (!shimmerSequenceActive || !button.classList.contains('is-shimmering')) {
    return
  }

  button.classList.remove('is-shimmering')
  pendingShimmerEnds = Math.max(0, pendingShimmerEnds - 1)

  if (pendingShimmerEnds > 0) {
    return
  }

  shimmerPassCount += 1

  if (shimmerPassCount >= getMaxShimmerPasses()) {
    if (usesBorderTraceSequence()) {
      scheduleBorderTraceAfterShimmer()
      return
    }

    completeAttentionSequence()
    return
  }

  if (canRunPresentationPlayback() && !isMobileScreenshotMode()) {
    setDemoStatusText('Скоро повтор підсвітки — якщо Sign up ще не натиснули.')
  }

  shimmerRepeatTimeoutId = window.setTimeout(() => {
    shimmerRepeatTimeoutId = null

    if (!canRunPresentationPlayback() || !shimmerSequenceActive) {
      return
    }

    playShimmerPassAll()
  }, SHIMMER_REPEAT_DELAY_MS)
}

function handleBorderTraceAnimationEnd(button) {
  if (!button.classList.contains('is-border-tracing')) {
    return
  }

  if (button._borderTraceTimeoutId) {
    window.clearTimeout(button._borderTraceTimeoutId)
    button._borderTraceTimeoutId = null
  }

  button.classList.remove('is-border-tracing')
  pendingBorderTraceEnds = Math.max(0, pendingBorderTraceEnds - 1)

  if (!shimmerSequenceActive) {
    return
  }

  if (pendingBorderTraceEnds > 0) {
    return
  }

  completeAttentionSequence()
}

function startShimmerSequence() {
  cancelShimmerSequence()
  shimmerSequenceActive = true

  if (isPlaybackBlocked()) {
    shimmerSequenceActive = false
    return
  }

  readyAnimationTimeoutId = window.setTimeout(() => {
    readyAnimationTimeoutId = null
    playShimmerPassAll()
  }, READY_DELAY_MS)
}

function reflow(element) {
  void element.offsetWidth
}

function isPlaybackBlocked() {
  return (
    demoRoot.dataset.freezeAnimations === 'true' ||
    demoRoot.dataset.simulateReducedMotion === 'true' ||
    prefersReducedMotionQuery.matches
  )
}

function showReplayBlockedMessage(reason) {
  if (reason === 'freeze') {
    setDemoStatusText('Переграти не можна — анімацію зафіксовано.')
    return
  }

  setDemoStatusText(
    'Переграти не можна — увімкнено «Без анімацій» (у блоці «Додаткові перевірки» або в macOS).'
  )
}

function restartVariantAnimation(button, durationMs) {
  if (isPlaybackBlocked()) {
    if (demoRoot.dataset.freezeAnimations === 'true') {
      showReplayBlockedMessage('freeze')
    } else {
      showReplayBlockedMessage('reduced')
    }
    return
  }

  const shouldRestoreReady = button.classList.contains('is-ready-animate')

  button.classList.remove('is-ready-animate', 'is-hover-animate')
  reflow(button)

  button.classList.add('is-hover-animate')

  if (button._instantAnimTimeoutId) {
    window.clearTimeout(button._instantAnimTimeoutId)
  }

  button._instantAnimTimeoutId = window.setTimeout(() => {
    button.classList.remove('is-hover-animate')

    if (shouldRestoreReady && isFormReady()) {
      button.classList.add('is-ready-animate')
    }

    button._instantAnimTimeoutId = null
  }, durationMs)
}

function triggerReadyAnimations() {
  clearVariantAnimations()

  if (usesHoverOnlyVariant()) {
    return
  }

  if (usesShimmerSequence()) {
    startShimmerSequence()
    return
  }

  if (usesPopShimmerSequence()) {
    startPopShimmerSequence()
    return
  }

  if (usesHoverGlowSequence()) {
    startHoverGlowSequence()
    return
  }

  if (usesHoverGlowInfiniteSequence()) {
    startHoverGlowInfiniteSequence()
    return
  }

  if (usesBorderGlowInfiniteSequence()) {
    startBorderGlowInfiniteSequence()
    return
  }

  if (usesGenericReadySequence()) {
    startGenericReadySequence()
  }
}

function startHoverGlowInfiniteSequence() {
  cancelShimmerSequence()
  cancelPopShimmerSequence()
  cancelGenericReadySequence()
  cancelMobileLoop()

  if (isPlaybackBlocked()) {
    return
  }

  const button = getPrimaryCta()
  applyCtaAnimationClass(button, HOVER_GLOW_INFINITE_VARIANT)
  button.classList.remove('is-ready-animate', 'is-hover-animate')
}

function startBorderGlowInfiniteSequence() {
  cancelShimmerSequence()
  cancelPopShimmerSequence()
  cancelGenericReadySequence()
  cancelMobileLoop()

  if (isPlaybackBlocked()) {
    return
  }

  const button = getPrimaryCta()
  applyCtaAnimationClass(button, BORDER_GLOW_INFINITE_VARIANT)
  button.classList.remove('is-ready-animate', 'is-hover-animate')
  playBorderTrace(button)
}

function clearReadyAnimateClasses() {
  getAnimatedButtons().forEach(button => {
    button.classList.remove('is-ready-animate', 'is-hover-animate')
    clearJsScheduledReadyDelay(button)
  })
}

function startHoverGlowSequence() {
  cancelGenericReadySequence()
  genericReadySequenceActive = true
  genericReadyPassCount = 0

  if (isPlaybackBlocked()) {
    genericReadySequenceActive = false
    return
  }

  runHoverGlowPass(READY_DELAY_MS)
}

function runHoverGlowPass(initialDelayMs) {
  if (!genericReadySequenceActive || !canRunPresentationPlayback()) {
    return
  }

  genericReadyTimeoutId = window.setTimeout(() => {
    genericReadyTimeoutId = null

    if (!genericReadySequenceActive || !canRunPresentationPlayback()) {
      return
    }

    playGenericReadyPass()

    genericReadyTimeoutId = window.setTimeout(() => {
      genericReadyTimeoutId = null
      handleHoverGlowPassEnd()
    }, HOVER_GLOW_PASS_MS)
  }, initialDelayMs)
}

function handleHoverGlowPassEnd() {
  if (!genericReadySequenceActive) {
    return
  }

  clearReadyAnimateClasses()
  genericReadyPassCount += 1
  const maxPasses = getMaxGenericReadyPasses()

  if (genericReadyPassCount >= maxPasses) {
    completeHoverGlowSequence()
    return
  }

  if (!isMobileScreenshotMode()) {
    setDemoStatusText('Скоро повтор обводки — якщо Sign up ще не натиснули.')
  }

  genericReadyRepeatTimeoutId = window.setTimeout(() => {
    genericReadyRepeatTimeoutId = null
    runHoverGlowPass(0)
  }, HOVER_GLOW_RESTART_GAP_MS)
}

function completeHoverGlowSequence() {
  genericReadySequenceActive = false
  genericReadyPassCount = 0
  clearReadyAnimateClasses()

  if (!canRunPresentationPlayback() || !usesHoverGlowSequence()) {
    return
  }

  if (isMobileScreenshotMode()) {
    setDemoStatusText('Наступний показ — через ~7 с.')
    scheduleMobilePresentationLoop(startHoverGlowSequence)
    return
  }

  setDemoStatusText(
    'Анімація завершена (два покази по ~7 с). Можна натиснути Sign up або «Переграти ще раз».'
  )
}

function playGenericReadyPass() {
  getAnimatedButtons().forEach(button => {
    button.classList.remove('is-ready-animate', 'is-hover-animate')
    if (usesCssReadyDelayOnReadyAnimate()) {
      setJsScheduledReadyDelay(button)
    }
    reflow(button)
    button.classList.add('is-ready-animate')
  })
}

function completeGenericReadySequence() {
  genericReadySequenceActive = false
  genericReadyPassCount = 0
  clearReadyAnimateClasses()

  if (!canRunPresentationPlayback() || !usesGenericReadySequence()) {
    return
  }

  if (isMobileScreenshotMode()) {
    setDemoStatusText('Наступний показ — через ~7 с.')
    scheduleMobilePresentationLoop(startGenericReadySequence)
    return
  }

  setDemoStatusText(
    'Анімація завершена (два покази). Можна натиснути Sign up або «Переграти ще раз».'
  )
}

function scheduleGenericReadyRepeat() {
  if (!genericReadySequenceActive || !canRunPresentationPlayback()) {
    return
  }

  if (!isMobileScreenshotMode()) {
    setDemoStatusText('Скоро повтор підсвітки — якщо Sign up ще не натиснули.')
  }

  genericReadyRepeatTimeoutId = window.setTimeout(() => {
    genericReadyRepeatTimeoutId = null
    runGenericReadyPass(0)
  }, SHIMMER_REPEAT_DELAY_MS)
}

function runGenericReadyPass(initialDelayMs) {
  if (!genericReadySequenceActive || !canRunPresentationPlayback()) {
    return
  }

  genericReadyTimeoutId = window.setTimeout(() => {
    genericReadyTimeoutId = null

    if (!genericReadySequenceActive || !canRunPresentationPlayback()) {
      return
    }

    playGenericReadyPass()
    const durationMs = VARIANT_ANIMATION_MS[selectedVariant] ?? 1000

    genericReadyTimeoutId = window.setTimeout(() => {
      genericReadyTimeoutId = null
      handleGenericReadyPassEnd()
    }, durationMs)
  }, initialDelayMs)
}

function handleGenericReadyPassEnd() {
  if (!genericReadySequenceActive) {
    return
  }

  genericReadyPassCount += 1
  const maxPasses = getMaxGenericReadyPasses()

  if (genericReadyPassCount < maxPasses) {
    scheduleGenericReadyRepeat()
    return
  }

  completeGenericReadySequence()
}

function startGenericReadySequence() {
  cancelGenericReadySequence()
  genericReadySequenceActive = true
  genericReadyPassCount = 0

  if (isPlaybackBlocked()) {
    genericReadySequenceActive = false
    return
  }

  runGenericReadyPass(READY_DELAY_MS)
}

function cancelPendingAnimations() {
  cancelShimmerSequence()
  cancelPopShimmerSequence()
  cancelGenericReadySequence()
  cancelMobileLoop()
  clearVariantAnimations()
}

function syncMobilePresentationState() {
  if (statusEl) {
    statusEl.hidden = true
    setDemoStatusText('')
  }
}

function syncFormState() {
  if (isMobileScreenshotMode()) {
    syncMobilePresentationState()
    syncCtaDisabledVisual()
    return
  }

  const ready = isFormReady()

  if (prefersReducedMotionQuery.matches || demoRoot.dataset.simulateReducedMotion === 'true') {
    setDemoStatusState(ready ? 'ready' : 'pending')
    setDemoStatusText(
      'Анімації вимкнено («Без анімацій» у додаткових перевірках). Переграти покаже лише статичну підсвітку.'
    )
    wasReady = ready
    syncCtaDisabledVisual()
    return
  }

  if (ready) {
    setDemoStatusState('ready')
    setDemoStatusText(getReadyStatusMessage())

    if (!wasReady) {
      triggerReadyAnimations()
    }
  } else {
    setDemoStatusState('pending')

    if (!isEmailValid() && emailInput.value.trim() === '') {
      setDemoStatusText(getEmptyFormStatus())
    } else if (!isEmailValid()) {
      setDemoStatusText(
        isSimulateCtaDisabledEnabled()
          ? 'Додайте коректний email або натисніть «Заповнити форму». Sign up неактивна, поки форма не готова.'
          : 'Додайте коректний email або натисніть «Заповнити форму».'
      )
    } else if (!isPasswordValid()) {
      setDemoStatusText(
        'Додайте пароль (мін. 8 символів) або натисніть «Заповнити форму».'
      )
    } else if (!termsInput.checked) {
      setDemoStatusText('Потрібно прийняти умови або натиснути «Заповнити форму».')
    } else {
      setDemoStatusText(getEmptyFormStatus())
    }

    cancelPendingAnimations()
  }

  wasReady = ready
  syncCtaDisabledVisual()
}

function applyPreset(preset) {
  cancelPendingAnimations()
  wasReady = false

  if (preset === 'empty') {
    emailInput.value = ''
    passwordInput.value = ''
    termsInput.checked = true
    document.getElementById('marketing').checked = true
  }

  if (preset === 'ready') {
    emailInput.value = 'player@example.com'
    passwordInput.value = 'securepass'
    termsInput.checked = true
    document.getElementById('marketing').checked = true
  }

  presetButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.preset === preset))
  })

  syncFormState()
}

function applyCtaLabel(label) {
  document.querySelectorAll('.ui-button__label').forEach(el => {
    el.textContent = label
  })

  labelButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.label === label))
  })
}

function setViewOption(toggleId, enabled) {
  if (toggleId === 'reduced-motion') {
    demoRoot.dataset.simulateReducedMotion = String(enabled)
  }

  if (toggleId === 'freeze-animations') {
    demoRoot.dataset.freezeAnimations = String(enabled)
  }

  toggleButtons.forEach(button => {
    if (button.dataset.toggle === toggleId) {
      button.setAttribute('aria-pressed', String(enabled))
    }
  })
}

function toggleViewOption(toggleId) {
  const button = document.querySelector(`[data-toggle="${toggleId}"]`)
  if (!button) {
    return
  }

  const enabled = button.getAttribute('aria-pressed') !== 'true'
  setViewOption(toggleId, enabled)
}

function playInstantVariantAnimation(button) {
  const variantId = button.dataset.variantButton
  const durationMs = VARIANT_ANIMATION_MS[variantId] ?? 1000
  restartVariantAnimation(button, durationMs)
}

function replayPresentationCta() {
  const primaryCta = getPrimaryCta()

  if (isMobileScreenshotMode()) {
    startMobilePresentationPlayback()
    return
  }

  if (usesHoverOnlyVariant()) {
    if (isPlaybackBlocked()) {
      showReplayBlockedMessage(demoRoot.dataset.freezeAnimations === 'true' ? 'freeze' : 'reduced')
      return
    }

    replayArrowHoverPreview(primaryCta)
    return
  }

  if (usesPopShimmerSequence()) {
    if (isPlaybackBlocked()) {
      showReplayBlockedMessage(demoRoot.dataset.freezeAnimations === 'true' ? 'freeze' : 'reduced')
      return
    }

    cancelPopShimmerSequence()
    replayPopShimmer(primaryCta)
    setDemoStatusText('Переграти ще раз — короткий показ на кнопці Sign up.')
    return
  }

  if (usesShimmerSequence()) {
    if (isPlaybackBlocked()) {
      showReplayBlockedMessage(demoRoot.dataset.freezeAnimations === 'true' ? 'freeze' : 'reduced')
      return
    }

    if (selectedVariant === SHIMMER_BORDER_VARIANT) {
      playBorderTrace(primaryCta)
      setDemoStatusText('Переграти ще раз — показ обводки на кнопці.')
      return
    }

    playShimmerPass(primaryCta)
    setDemoStatusText('Переграти ще раз — один показ шимеру на кнопці.')
    return
  }

  if (usesHoverGlowSequence()) {
    if (isPlaybackBlocked()) {
      showReplayBlockedMessage(demoRoot.dataset.freezeAnimations === 'true' ? 'freeze' : 'reduced')
      return
    }

    startHoverGlowSequence()
    return
  }

  const durationMs = VARIANT_ANIMATION_MS[selectedVariant] ?? 1000
  restartVariantAnimation(primaryCta, durationMs)
}

function findVariantCatalogArticle(variantId) {
  return variantCatalog?.querySelector(`[data-variant="${variantId}"]`) ?? null
}

function renderVariantDetail(variantId) {
  if (!variantDetailMount) {
    return
  }

  const source = findVariantCatalogArticle(variantId)
  variantDetailMount.replaceChildren()

  if (!source) {
    return
  }

  const clone = source.cloneNode(true)
  clone.classList.add('variant-card--detail')
  clone.querySelector('.variant-card__preview')?.remove()
  clone.querySelector('.variant-card__actions')?.remove()
  variantDetailMount.appendChild(clone)
  updateVariantDetailIntro(variantId)
}

function setDemoMode(mode) {
  demoRoot.dataset.demoMode = mode

  modeTabButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.demoMode === mode))
  })

  cancelPendingAnimations()
  wasReady = false
  applyPrimaryCtaAnimation(selectedVariant)
  syncDemoControlsForMode()
  syncPresentationReplayUi()

  if (isMobileScreenshotMode()) {
    startMobilePresentationPlayback()
    return
  }

  syncFormState()
}

function setSelectedVariant(variantId) {
  if (!ANIMATION_VARIANTS.includes(variantId)) {
    return
  }

  if (isVariantHiddenInUi(variantId)) {
    setSelectedVariant(SHIMMER_VARIANT)
    return
  }

  selectedVariant = variantId
  cancelPendingAnimations()
  applyPrimaryCtaAnimation(variantId)
  clearJsScheduledReadyDelayOnButtons()

  if (animationPicker) {
    const input = animationPicker.querySelector(`input[value="${variantId}"]`)
    if (input instanceof HTMLInputElement) {
      input.checked = true
    }
  }

  renderVariantDetail(variantId)
  syncPresentationReplayUi()

  if (isMobileScreenshotMode()) {
    window.requestAnimationFrame(() => {
      startMobilePresentationPlayback()
    })
    return
  }

  if (usesHoverOnlyVariant()) {
    return
  }

  if (isFormReady()) {
    setDemoStatusState('ready')
    setDemoStatusText(
      'Варіант змінено. Натисніть «Заповнити форму» або «Відтворити», щоб побачити анімацію.'
    )
    triggerReadyAnimations()
    return
  }

  syncFormState()
}

function replayVariantAnimation(variantId, replayTrigger = null) {
  const button = resolvePreviewButtonForReplay(replayTrigger, variantId)
  if (!button) {
    return
  }

  if (isArrowHoverVariant(variantId)) {
    replayArrowHoverPreview(button)
    return
  }

  if (variantId === SHIMMER_VARIANT) {
    playShimmerPass(button)
    return
  }

  if (variantId === SHIMMER_BORDER_VARIANT) {
    playBorderTrace(button)
    return
  }

  if (variantId === POP_SHIMMER_VARIANT) {
    replayPopShimmer(button)
    return
  }

  if (variantId === HOVER_GLOW_VARIANT) {
    if (isPlaybackBlocked()) {
      return
    }

    button.classList.remove('is-ready-animate', 'is-hover-animate')
    reflow(button)
    button.classList.add('is-ready-animate')

    if (button._hoverGlowPreviewTimeoutId) {
      window.clearTimeout(button._hoverGlowPreviewTimeoutId)
    }

    button._hoverGlowPreviewTimeoutId = window.setTimeout(() => {
      button.classList.remove('is-ready-animate', 'is-hover-animate')
      button._hoverGlowPreviewTimeoutId = null
    }, HOVER_GLOW_PASS_MS)
    return
  }

  if (variantId === HOVER_GLOW_INFINITE_VARIANT) {
    if (isPlaybackBlocked()) {
      return
    }

    applyCtaAnimationClass(button, HOVER_GLOW_INFINITE_VARIANT)
    button.classList.remove('is-ready-animate', 'is-hover-animate')
    return
  }

  if (variantId === BORDER_GLOW_INFINITE_VARIANT) {
    if (isPlaybackBlocked()) {
      return
    }

    applyCtaAnimationClass(button, BORDER_GLOW_INFINITE_VARIANT)
    button.classList.remove('is-ready-animate', 'is-hover-animate')
    playBorderTrace(button)
    return
  }

  playInstantVariantAnimation(button)
}

form.addEventListener('submit', event => {
  event.preventDefault()
})

form.addEventListener('input', syncFormState)
form.addEventListener('change', syncFormState)

function handlePrimaryCtaClick() {
  cancelShimmerSequence()
  cancelPopShimmerSequence()
  cancelGenericReadySequence()
  cancelMobileLoop()
}

function handleShimmerSweepEnd(button, event) {
  if (event.animationName !== 'cta-shimmer-sweep') {
    return
  }

  if (button.classList.contains(`${ANIMATION_CLASS_PREFIX}${POP_SHIMMER_VARIANT}`)) {
    handlePopShimmerAnimationEnd(button, event)
    return
  }

  handleShimmerAnimationEnd(button)
}

function handlePrimaryCtaAnimationEnd(event) {
  const primaryCta = getPrimaryCta()

  if (event.target !== primaryCta) {
    return
  }

  if (
    event.animationName === 'cta-shimmer-sweep' ||
    event.animationName === 'cta-pop-shimmer-scale'
  ) {
    if (primaryCta.classList.contains(`${ANIMATION_CLASS_PREFIX}${POP_SHIMMER_VARIANT}`)) {
      handlePopShimmerAnimationEnd(primaryCta, event)
      return
    }

    if (event.animationName === 'cta-shimmer-sweep') {
      handleShimmerSweepEnd(primaryCta, event)
    }
  }

  if (
    event.animationName === 'cta-border-angle' &&
    !shouldBorderTraceRunInfinite(button)
  ) {
    handleBorderTraceAnimationEnd(primaryCta)
  }
}

formCta.addEventListener('click', handlePrimaryCtaClick)
formCta.addEventListener('animationend', handlePrimaryCtaAnimationEnd)
if (mobileScreenshotCta) {
  mobileScreenshotCta.addEventListener('click', handlePrimaryCtaClick)
  mobileScreenshotCta.addEventListener('animationend', handlePrimaryCtaAnimationEnd)
}

variantButtons.forEach(button => {
  const variantId = button.dataset.variantButton ?? ''

  if (ATTENTION_SEQUENCE_VARIANTS.has(variantId)) {
    button.addEventListener('animationend', event => {
      if (event.animationName === 'cta-shimmer-sweep') {
        handleShimmerSweepEnd(button, event)
      }

      if (
    event.animationName === 'cta-border-angle' &&
    !shouldBorderTraceRunInfinite(button)
  ) {
        handleBorderTraceAnimationEnd(button)
      }
    })
  }

  if (POP_SHIMMER_SEQUENCE_VARIANTS.has(variantId)) {
    button.addEventListener('animationend', event => {
      if (
        event.animationName === 'cta-shimmer-sweep' ||
        event.animationName === 'cta-pop-shimmer-scale'
      ) {
        handlePopShimmerAnimationEnd(button, event)
      }
    })
  }
})

presetButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (isMobileScreenshotMode()) {
      return
    }

    const preset = button.dataset.preset
    if (preset === 'empty' || preset === 'ready') {
      applyPreset(preset)
    }
  })
})

labelButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.label) {
      applyCtaLabel(button.dataset.label)
    }
  })
})

demoRoot.addEventListener('click', event => {
  const replayTrigger = event.target.closest('[data-replay]')
  if (!(replayTrigger instanceof HTMLButtonElement) || !replayTrigger.dataset.replay) {
    return
  }

  replayVariantAnimation(replayTrigger.dataset.replay, replayTrigger)
})

toggleButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.toggle) {
      toggleViewOption(button.dataset.toggle)
      syncFormState()
    }
  })
})

modeTabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.demoMode
    if (mode === 'presentation' || mode === 'mobile-screenshot') {
      setDemoMode(mode)
    }
  })
})

if (animationPicker) {
  animationPicker.addEventListener('change', event => {
    const target = event.target
    if (target instanceof HTMLInputElement && target.name === 'animation-variant') {
      setSelectedVariant(target.value)
    }
  })
}

if (replayPresentationButton) {
  replayPresentationButton.addEventListener('click', () => {
    replayPresentationCta()
  })
}

variantButtons.forEach(button => {
  button.disabled = false

  if (CSS_ONLY_HOVER_VARIANTS.has(button.dataset.variantButton ?? '')) {
    return
  }

  button.addEventListener('mouseenter', () => {
    if (button.closest('.variant-catalog, .compare-all-variants, .variant-detail')) {
      return
    }

    if (button.dataset.variantButton === POP_SHIMMER_VARIANT) {
      replayPopShimmer(button)
      return
    }

    playInstantVariantAnimation(button)
  })
})

applyPrimaryCtaAnimation(selectedVariant)
renderVariantDetail(selectedVariant)
syncDemoControlsForMode()
syncPresentationReplayUi()
syncHoverOnlyPickerVisibility()
setDemoMode('presentation')
applyPreset('empty')
applyCtaLabel('Sign up')

if (simulateCtaDisabledInput) {
  simulateCtaDisabledInput.addEventListener('change', () => {
    syncCtaDisabledVisual()
    syncFormState()
  })
}

prefersReducedMotionQuery.addEventListener('change', () => {
  syncFormState()
})
