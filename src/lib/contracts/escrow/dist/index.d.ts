import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u32, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CBPT5TL25ZMHLC74MKGRMKMNHZD76G2PSMPDLQ3RSPRYVCG7XHXWEY76";
    };
};
export type DataKey = {
    tag: "Escrow";
    values: void;
};
export interface Milestone {
    amount: i128;
    description: string;
    id: u32;
    status: MilestoneStatus;
}
export interface EscrowState {
    client: string;
    freelancer: string;
    is_closed: boolean;
    is_disputed: boolean;
    milestones: Array<Milestone>;
    token: string;
    total_amount: i128;
}
export type MilestoneStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Submitted";
    values: void;
} | {
    tag: "Approved";
    values: void;
} | {
    tag: "Released";
    values: void;
} | {
    tag: "Disputed";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a get_state transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * View current escrow state (read-only)
     */
    get_state: (options?: MethodOptions) => Promise<AssembledTransaction<EscrowState>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize escrow — called by client
     */
    initialize: ({ client, freelancer, token, milestone_amounts, milestone_descriptions }: {
        client: string;
        freelancer: string;
        token: string;
        milestone_amounts: Array<i128>;
        milestone_descriptions: Array<string>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a flag_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Either party can flag a dispute — funds locked
     */
    flag_dispute: ({ caller }: {
        caller: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Resolve dispute — admin or multisig releases to specified party
     */
    resolve_dispute: ({ resolver, release_to, amount }: {
        resolver: string;
        release_to: string;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a submit_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Freelancer submits a milestone for review
     */
    submit_milestone: ({ milestone_id }: {
        milestone_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a approve_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Client approves a milestone and releases funds
     */
    approve_milestone: ({ milestone_id }: {
        milestone_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        get_state: (json: string) => AssembledTransaction<EscrowState>;
        initialize: (json: string) => AssembledTransaction<number>;
        flag_dispute: (json: string) => AssembledTransaction<null>;
        resolve_dispute: (json: string) => AssembledTransaction<null>;
        submit_milestone: (json: string) => AssembledTransaction<null>;
        approve_milestone: (json: string) => AssembledTransaction<null>;
    };
}
