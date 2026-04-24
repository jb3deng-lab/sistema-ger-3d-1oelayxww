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
import { FileText, CheckCircle, XCircle, Edit, Plus, Trash2 } from 'lucide-react'
import { QuoteForm } from '@/components/quotes/QuoteForm'
import { InvoicePreview } from '@/components/quotes/InvoicePreview'

export default function Quotes() {
  const { quotes, updateQuoteStatus, addQuote, deleteQuote } = useApp()
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
        {/* Visualização Desktop */}
        <div className="hidden md:block overflow-x-auto">
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
                        onClick={() => {
                          if (window.confirm('Deseja duplicar este orçamento?')) {
                            addQuote({
                              ...quote,
                              id: Date.now().toString(),
                              status: 'Pendente',
                              date: new Date().toISOString(),
                            })
                          }
                        }}
                        title="Duplicar"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </Button>
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
                        <FileText className="h-4 w-4 text-primary" />
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
                            deleteQuote(quote.id)
                          }
                        }}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>{' '}
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

        {/* Visualização Mobile Otimizada */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="border rounded-lg p-4 space-y-4 bg-background shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium text-foreground line-clamp-2">{quote.clientName}</span>
                <Badge
                  variant="outline"
                  className={
                    quote.status === 'Aprovado'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap'
                      : quote.status === 'Recusado'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 whitespace-nowrap'
                        : 'bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap'
                  }
                >
                  {quote.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <br />
                  <span className="font-medium">
                    {new Date(quote.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <br />
                  <span className="font-medium text-primary">R$ {quote.finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">
                  Itens ({quote.items.length}):
                </span>
                <div className="text-xs text-muted-foreground flex flex-col gap-1 bg-muted/30 p-2 rounded-md">
                  {quote.items.map((i, idx) => (
                    <span key={idx} className="truncate">
                      • {i.pieceName} ({i.weight}g)
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-1 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (window.confirm('Deseja duplicar este orçamento?')) {
                      addQuote({
                        ...quote,
                        id: Date.now().toString(),
                        status: 'Pendente',
                        date: new Date().toISOString(),
                      })
                    }
                  }}
                  title="Duplicar"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleOpenEdit(quote.id)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setInvoiceQuote(quote)}
                  title="Gerar PDF"
                >
                  <FileText className="h-4 w-4 text-primary" />
                </Button>

                {quote.status === 'Pendente' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuoteStatus(quote.id, 'Aprovado')}
                      title="Aprovar"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuoteStatus(quote.id, 'Recusado')}
                      title="Recusar"
                    >
                      <XCircle className="h-4 w-4 text-rose-500" />
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
                      deleteQuote(quote.id)
                    }
                  }}
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {quotes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              Nenhum orçamento encontrado.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
