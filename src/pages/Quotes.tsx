import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, CheckCircle, XCircle, Edit, Plus } from 'lucide-react'
import { QuoteForm } from '@/components/quotes/QuoteForm'
import { InvoicePreview } from '@/components/quotes/InvoicePreview'

export default function Quotes() {
  const { quotes, updateQuoteStatus } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [invoiceQuote, setInvoiceQuote] = useState<any>(null)

  const handleOpenNew = () => {
    setEditId(null)
    setFormOpen(true)
  }
  const handleOpenEdit = (id: string) => {
    setEditId(id)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Orçamentos</h2>
        <Button onClick={handleOpenNew} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
        </Button>
      </div>

      <QuoteForm open={formOpen} onOpenChange={setFormOpen} editId={editId} />
      <InvoicePreview
        quote={invoiceQuote}
        open={!!invoiceQuote}
        onOpenChange={(o) => !o && setInvoiceQuote(null)}
      />

      <Card className="border-none shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium text-foreground">{quote.clientName}</TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground flex flex-col gap-1">
                      {quote.items.map((i, idx) => (
                        <span key={idx}>
                          {i.pieceName} ({i.weight}g)
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(quote.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">R$ {quote.finalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        quote.status === 'Aprovado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : quote.status === 'Recusado'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(quote.id)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setInvoiceQuote(quote)}
                        title="Gerar PDF (Nota)"
                      >
                        <FileText className="h-4 w-4 text-indigo-500" />
                      </Button>
                      {quote.status === 'Pendente' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuoteStatus(quote.id, 'Aprovado')}
                            title="Aprovar"
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuoteStatus(quote.id, 'Recusado')}
                            title="Recusar"
                          >
                            <XCircle className="h-4 w-4 text-rose-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {quotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum orçamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
