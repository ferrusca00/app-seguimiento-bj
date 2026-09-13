import { mount } from '@vue/test-utils'
import SeguimientoPage from '@/views/SeguimientoPage.vue'
import { describe, expect, test } from 'vitest'

describe('SeguimientoPage.vue', () => {
  test('renders servicios activos view', () => {
    const wrapper = mount(SeguimientoPage)
    expect(wrapper.text()).toMatch('Servicios Activos')
  })
})
