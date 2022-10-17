#-----------------------------------------------------------------------------
#  Copyright (c) SAGE3 Development Team
#
#  Distributed under the terms of the SAGE3 License.  The full license is in
#  the file LICENSE, distributed as part of this software.
#-----------------------------------------------------------------------------

from smartbits.smartbit import SmartBit
from smartbits.smartbit import TrackedBaseModel
from pydantic import BaseModel


class NoteState(TrackedBaseModel):
    text: str


class Note(SmartBit):
    # the key that is assigned to this in state is
    state: NoteState






