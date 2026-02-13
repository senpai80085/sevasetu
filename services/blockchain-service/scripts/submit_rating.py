"""
Blockchain rating submission script.

This module provides functionality to submit caregiver ratings
to the TrustPassport smart contract.

Note: Backend signs transactions. No wallet UI required.
"""

from web3 import Web3
from typing import Dict, Any
import os
import json
from pathlib import Path


class TrustPassportClient:
    """
    Client for interacting with TrustPassport smart contract.
    
    Handles transaction signing and submission from backend.
    """
    
    def __init__(
        self,
        contract_address: str,
        contract_abi_path: str,
        rpc_url: str = "http://localhost:8545",
        private_key: str = None
    ):
        """
        Initialize blockchain client.
        
        Args:
            contract_address: Deployed contract address
            contract_abi_path: Path to contract ABI JSON
            rpc_url: Blockchain RPC endpoint
            private_key: Private key for signing (from env var in production)
        """
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.contract_address = Web3.to_checksum_address(contract_address)
        
        # Load contract ABI
        with open(contract_abi_path, 'r') as f:
            contract_abi = json.load(f)
        
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=contract_abi
        )
        
        # Private key for signing (use environment variable in production)
        self.private_key = private_key or os.getenv("BLOCKCHAIN_PRIVATE_KEY")
        if self.private_key:
            self.account = self.w3.eth.account.from_key(self.private_key)
        else:
            self.account = None
    
    def submit_rating(
        self,
        caregiver_hash: str,
        rating: int
    ) -> Dict[str, Any]:
        """
        Submit a rating to the blockchain.
        
        Args:
            caregiver_hash: Privacy-preserving caregiver identifier (hex string)
            rating: Rating value (1-5)
            
        Returns:
            Transaction receipt
            
        Raises:
            ValueError: If rating not in range [1, 5]
            Exception: If blockchain interaction fails
        """
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")
        
        if not self.account:
            raise Exception("No private key configured for transaction signing")
        
        # Convert caregiver hash to bytes32
        caregiver_hash_bytes = Web3.to_bytes(hexstr=caregiver_hash)
        if len(caregiver_hash_bytes) > 32:
            # Hash it if too long
            caregiver_hash_bytes = Web3.keccak(text=caregiver_hash)
        
        # Build transaction
        txn = self.contract.functions.submitRating(
            caregiver_hash_bytes,
            rating
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        # Sign transaction
        signed_txn = self.w3.eth.account.sign_transaction(
            txn,
            private_key=self.private_key
        )
        
        # Send transaction
        txn_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(txn_hash)
        
        return {
            "transaction_hash": receipt['transactionHash'].hex(),
            "block_number": receipt['blockNumber'],
            "gas_used": receipt['gasUsed'],
            "status": "success" if receipt['status'] == 1 else "failed"
        }


def submit_rating_from_backend(
    caregiver_hash: str,
    rating: int,
    contract_address: str = None,
    rpc_url: str = "http://localhost:8545"
) -> Dict[str, Any]:
    """
    Convenience function to submit rating from backend.
    
    Args:
        caregiver_hash: Caregiver identifier
        rating: Rating (1-5)
        contract_address: Contract address (from env if not provided)
        rpc_url: RPC endpoint
        
    Returns:
        Transaction result
    """
    # Get config from environment
    contract_address = contract_address or os.getenv("TRUST_PASSPORT_ADDRESS")
    abi_path = Path(__file__).parent.parent / "contracts" / "TrustPassport_ABI.json"
    
    # Initialize client
    client = TrustPassportClient(
        contract_address=contract_address,
        contract_abi_path=str(abi_path),
        rpc_url=rpc_url
    )
    
    # Submit rating
    return client.submit_rating(caregiver_hash, rating)


if __name__ == "__main__":
    # Example usage (for testing)
    print("Blockchain rating submission script")
    print("Configure TRUST_PASSPORT_ADDRESS and BLOCKCHAIN_PRIVATE_KEY environment variables")
    print("\nExample usage:")
    print("  result = submit_rating_from_backend('0xabc123...', 5)")
