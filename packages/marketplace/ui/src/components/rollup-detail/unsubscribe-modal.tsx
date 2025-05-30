import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { ArrowRight } from "lucide-react";
import { zeroAddress } from "viem";
import { StepCard } from "../step-card";
import { Offer, Order, UnsubscribeStep } from "@/types";
import { useUnsubscribe } from "@/lib/hooks/use-unsubscribe";

export const UnsubscribeModal: React.FC<
  {
    order: Order;
    offer: Offer;
    disabled?: boolean;
    onClose: () => void;
  } & ButtonProps
> = ({ order, offer, disabled, onClose, ...props }) => {
  const {
    step,
    isTerminatePending,
    terminate,
    setBatcherAddress,
    setOracleAddress,
    setSequencerAddress,
  } = useUnsubscribe({ order, offer });

  if ((order.terminatedAt !== 0n && step === UnsubscribeStep.Done) || order.fulfilledAt === 0n) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button {...props}>
          {step === UnsubscribeStep.Unsubscribe
            ? "Unsubscribe"
            : "Complete unsubscribe"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-12">
        <ScrollArea className="max-h-[600px]">
          <DialogHeader className="space-y-4">
            <DialogTitle>Unsubscribe</DialogTitle>
            <DialogDescription>
              Terminate payments and revoke provider permissions. This is
              irreversible. Please follow the steps below to unsubscribe.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-[#FFF4F4] text-[#911A27] py-2 px-4 rounded-md mt-8 text-sm">
            All unsubscribe actions are permanent and cannot be undone.
          </div>

          <StepCard
            className="mt-8"
            title="1. Terminate payments."
            description="This will stop immediately the payment flow. Be aware the minimum payment unit is 30 days. You'll receive the remaining funds right away."
            isComplete={step > UnsubscribeStep.Unsubscribe}
            isActive={step === UnsubscribeStep.Unsubscribe}
          >
            <Button
              isPending={isTerminatePending}
              className="mt-6"
              onClick={() => {
                terminate()
              }}
            >
              Terminate payments <ArrowRight />
            </Button>
          </StepCard>

          <StepCard
            className="mt-6"
            title="2. Remove sequencer permissions."
            description="Remove sequencer permissions from provider."
            isComplete={step > UnsubscribeStep.SetSequencer}
            isActive={step === UnsubscribeStep.SetSequencer}
          >
            <Button
              className="mt-6"
              onClick={() => setSequencerAddress(zeroAddress)}
            >
              Remove permission <ArrowRight />
            </Button>
          </StepCard>

          <StepCard
            className="mt-6"
            title="3. Remove batcher permissions."
            description="Remove batcher permissions from provider."
            isComplete={step > UnsubscribeStep.SetBatcher}
            isActive={step === UnsubscribeStep.SetBatcher}
          >
            <Button
              className="mt-6"
              onClick={() => setBatcherAddress(zeroAddress)}
            >
              Remove permission <ArrowRight />
            </Button>
          </StepCard>

          <StepCard
            className="mt-6"
            title="4. Remove Challenger and Proposer."
            description="Remove Challenger and Proposer permissions from provider."
            isComplete={step > UnsubscribeStep.SetOracle}
            isActive={step === UnsubscribeStep.SetOracle}
          >
            <Button
              className="mt-6"
              onClick={() => setOracleAddress(zeroAddress, zeroAddress)}
            >
              Remove permission <ArrowRight />
            </Button>
          </StepCard>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
