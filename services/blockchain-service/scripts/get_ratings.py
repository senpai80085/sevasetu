"""
Blockchain rating retrieval script.

This module provides functionality to retrieve caregiver ratings
from the TrustPassport smart contract.
"""

from web3 import Web3
from typing import List, Dict, Any
import os
import json
from pathlib import Path
from datetime import datetime


class TrustPassportReader:
    """
    Read-only client for TrustPassport smart contract.
    
    Retrieves ratings and statistics without signing transactions.
    """
    
    def __init__(
        self,
        contract_address: str,
        contract_abi_path: str,
        rpc_url: str = "http://localhost:8545"
    ):
        """
        Initialize blockchain reader.
        
        Args:
            contract_address: Deployed contract address
            contract_abi_path: Path to contract ABI JSON
            rpc_url: Blockchain RPC endpoint
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
    
    def get_ratings(self, caregiver_hash: str) -> List[Dict[str, Any]]:
        """
        Retrieve all ratings for a specific caregiver.
        
        Args:
            caregiver_hash: Privacy-preserving caregiver identifier
            
        Returns:
            List of rating records with details
        """
        # Convert hash to bytes32
        caregiver_hash_bytes = Web3.to_bytes(hexstr=caregiver_hash)
        if len(caregiver_hash_bytes) > 32:
            caregiver_hash_bytes = Web3.keccak(text=caregiver_hash)
        
        # Get rating IDs
        rating_ids = self.contract.functions.getCaregiverRatingIds(
            caregiver_hash_bytes
        ).call()
        
        # Fetch each rating
        ratings = []
        for rating_id in rating_ids:
            cg_hash, rating, timestamp, submitter = self.contract.functions.getRating(
                rating_id
            ).call()
            
            ratings.append({
                "rating_id": rating_id,
                "rating": rating,
                "timestamp": timestamp,
                "datetime": datetime.fromtimestamp(timestamp).isoformat(),
                "submitter": submitter
            })
        
        return ratings
    
    def get_average_rating(self, caregiver_hash: str) -> float:
        """
        Get average rating for a caregiver.
        
        Args:
            caregiver_hash: Caregiver identifier
            
        Returns:
            Average rating (0.0-5.0)
        """
        # Convert hash to bytes32
        caregiver_hash_bytes = Web3.to_bytes(hexstr=caregiver_hash)
        if len(caregiver_hash_bytes) > 32:
            caregiver_hash_bytes = Web3.keccak(text=caregiver_hash)
        
        # Get average (scaled by 100)
        avg_scaled = self.contract.functions.getAverageRating(
            caregiver_hash_bytes
        ).call()
        
        # Convert to float
        return avg_scaled / 100.0
    
    def get_total_ratings(self) -> int:
        """
        Get total number of ratings in the system.
        
        Returns:
            Total rating count
        """
        return self.contract.functions.getTotalRatings().call()


def get_ratings_from_blockchain(
    caregiver_hash: str,
    contract_address: str = None,
    rpc_url: str = "http://localhost:8545"
) -> Dict[str, Any]:
    """
    Convenience function to get caregiver ratings from blockchain.
    
    Args:
        caregiver_hash: Caregiver identifier
        contract_address: Contract address (from env if not provided)
        rpc_url: RPC endpoint
        
    Returns:
        Dictionary with ratings and statistics
    """
    # Get config from environment
    contract_address = contract_address or os.getenv("TRUST_PASSPORT_ADDRESS")
    abi_path = Path(__file__).parent.parent / "contracts" / "TrustPassport_ABI.json"
    
    # Initialize reader
    reader = TrustPassportReader(
        contract_address=contract_address,
        contract_abi_path=str(abi_path),
        rpc_url=rpc_url
    )
    
    # Get ratings
    ratings = reader.get_ratings(caregiver_hash)
    average = reader.get_average_rating(caregiver_hash)
    
    return {
        "caregiver_hash": caregiver_hash,
        "total_ratings": len(ratings),
        "average_rating": average,
        "ratings": ratings
    }


if __name__ == "__main__":
    # Example usage
    print("Blockchain rating retrieval script")
    print("Configure TRUST_PASSPORT_ADDRESS environment variable")
    print("\nExample usage:")
    print("  result = get_ratings_from_blockchain('0xabc123...')")
