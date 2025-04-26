import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { Copy, Mail } from "lucide-react";
import { useState } from "react";

interface ShareDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ task, open, onOpenChange }: ShareDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const shareUrl = `${window.location.origin}/tasks/${task.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link",
      });
    }
  };

  const handleEmailShare = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address",
      });
      return;
    }

    const mailtoUrl = `mailto:${email}?subject=Task: ${task.title}&body=Check out this task: ${shareUrl}`;
    window.location.href = mailtoUrl;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Task</DialogTitle>
          <DialogDescription>
            Share this task with others via link or email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={shareUrl}
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Share via Email</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleEmailShare}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 