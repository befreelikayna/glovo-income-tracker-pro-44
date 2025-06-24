
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import { useEarnings, Earning } from "@/hooks/useEarnings";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const EarningsManager = () => {
  const { earnings, loading, addEarning, deleteEarning, refetch } = useEarnings();
  const { toast } = useToast();
  const [editingEarning, setEditingEarning] = useState<Earning | null>(null);
  const [dailyAmount, setDailyAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (earning: Earning) => {
    setEditingEarning(earning);
    setDailyAmount(earning.daily_amount.toString());
    setCashAmount(earning.cash_amount.toString());
    setSelectedDate(earning.date);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingEarning(null);
    setDailyAmount("");
    setCashAmount("");
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!dailyAmount || !selectedDate) {
      toast({
        title: "Error",
        description: "Please fill in date and daily amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await addEarning(parseFloat(dailyAmount), parseFloat(cashAmount) || 0, selectedDate);
      setIsDialogOpen(false);
      // Reset form
      setDailyAmount("");
      setCashAmount("");
      setSelectedDate("");
      setEditingEarning(null);
    } catch (error) {
      console.error('Error saving earning:', error);
    }
  };

  const handleDelete = async (earningId: string) => {
    try {
      await deleteEarning(earningId);
    } catch (error) {
      console.error('Error deleting earning:', error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading earnings...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Manage Earnings</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-glovo-green hover:bg-glovo-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Earning
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-glovo-dark">
                {editingEarning ? 'Edit Earning' : 'Add New Earning'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-glovo-dark mb-2">
                  Date *
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glovo-dark mb-2">
                  Daily Amount (RON) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={dailyAmount}
                  onChange={(e) => setDailyAmount(e.target.value)}
                  placeholder="350.00"
                  className="border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glovo-dark mb-2">
                  Cash Amount (RON)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="50.00"
                  className="border-gray-300"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-glovo-green hover:bg-glovo-green/90">
                  {editingEarning ? 'Update' : 'Add'} Earning
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-0">
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Daily Amount</TableHead>
                <TableHead>Cash Amount</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.slice(0, 20).map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell className="font-medium">
                    {format(new Date(earning.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{earning.daily_amount.toFixed(2)} RON</TableCell>
                  <TableCell>{earning.cash_amount.toFixed(2)} RON</TableCell>
                  <TableCell className="font-semibold">
                    {earning.total_amount.toFixed(2)} RON
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(earning)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Earning</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the earning for {format(new Date(earning.date), 'MMM d, yyyy')}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(earning.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {earnings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No earnings recorded yet. Click "Add Earning" to get started.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EarningsManager;
