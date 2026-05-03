import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PazarListesi from '../components/PazarListesi.jsx'

const mockProducts = [
  {
    id: 1,
    name: 'Domates',
    abbr: 'DOM',
    unit: 'kg',
    category: 'Sebze',
    subtypes: ['Salkım'],
  },
]

const mockMarkets = [{ id: 10, name: 'Test Pazarı', city: 'Malatya', district: 'Merkez' }]

describe('PazarListesi', () => {
  it('ürün seç adımında arama kutusu ve liste indir olmadan karşılaştır görünür', () => {
    const setItems = vi.fn()
    render(
      <PazarListesi
        isOpen
        onToggle={() => {}}
        city="Malatya"
        selectedItems={[]}
        setSelectedItems={setItems}
        catalogMarkets={mockMarkets}
        catalogProducts={mockProducts}
      />,
    )

    expect(screen.getByPlaceholderText(/Ürün ara/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Karşılaştır/i })).toBeInTheDocument()
  })

  it('karşılaştır adımında görsel indir ve ai öneri butonları görünür', async () => {
    const item = {
      key: '1-default',
      productId: 1,
      name: 'Domates',
      parentName: 'Domates',
      abbr: 'DOM',
      unit: 'kg',
      qty: 1,
      checked: false,
    }
    render(
      <PazarListesi
        isOpen
        onToggle={() => {}}
        city="Malatya"
        selectedItems={[item]}
        setSelectedItems={() => {}}
        catalogMarkets={mockMarkets}
        catalogProducts={mockProducts}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Karşılaştır/i }))

    expect(await screen.findByRole('button', { name: /Listeyi görsel indir/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Bütçe planı/i }))
    expect(await screen.findByRole('button', { name: /Öneriyi getir/i })).toBeInTheDocument()
  })
})
