"""
Pytest configuration file.

Provides shared fixtures and test configuration.
"""

import pytest
import sys
import os

# Add services directory to path
project_root = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, os.path.join(project_root, 'services'))
